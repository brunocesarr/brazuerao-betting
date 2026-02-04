import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_EXPIRY_HOURS = 1 // 1 hour
const TOKEN_LENGTH = 32

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex')
}

/**
 * Create password reset token for user
 */
export async function createPasswordResetToken(email: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists (security)
      return {
        success: true,
        message:
          'Se o email existir, você receberá instruções para resetar sua senha.',
      }
    }

    // Invalidate any existing tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    })

    // Create new token
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS)

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      success: true,
      token,
      email: user.email,
      name: user.name,
      message: 'Email de recuperação enviado com sucesso.',
    }
  } catch (error) {
    console.error('[Password Reset] Create token error:', error)
    return {
      success: false,
      message: 'Erro ao processar solicitação.',
    }
  }
}

/**
 * Verify reset token
 */
export async function verifyResetToken(token: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return {
        valid: false,
        message: 'Token inválido.',
      }
    }

    if (resetToken.used) {
      return {
        valid: false,
        message: 'Este link já foi utilizado.',
      }
    }

    if (new Date() > resetToken.expiresAt) {
      return {
        valid: false,
        message: 'Este link expirou. Solicite um novo.',
      }
    }

    return {
      valid: true,
      userId: resetToken.userId,
      email: resetToken.user.email,
    }
  } catch (error) {
    console.error('[Password Reset] Verify token error:', error)
    return {
      valid: false,
      message: 'Erro ao verificar token.',
    }
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    // Verify token
    const verification = await verifyResetToken(token)

    if (!verification.valid) {
      return {
        success: false,
        message: verification.message,
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: verification.userId },
      data: { password: hashedPassword },
    })

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    })

    return {
      success: true,
      message: 'Senha alterada com sucesso!',
    }
  } catch (error) {
    console.error('[Password Reset] Reset password error:', error)
    return {
      success: false,
      message: 'Erro ao resetar senha.',
    }
  }
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens() {
  try {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            used: true,
            createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        ],
      },
    })

    console.log(`[Password Reset] Cleaned up ${result.count} expired tokens`)
    return result.count
  } catch (error) {
    console.error('[Password Reset] Cleanup error:', error)
    return 0
  }
}
