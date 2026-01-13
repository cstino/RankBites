import LoginForm from '@/components/auth/LoginForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
            <div className="w-full max-w-md p-8">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logo.svg"
                            alt="RankBites"
                            className="h-12"
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </div>
                </div>

                {/* Login Form */}
                <LoginForm />
            </div>
        </div>
    )
}
