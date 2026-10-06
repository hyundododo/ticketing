import AuthForm from '../features/auth/components/AuthForm'

function AuthPage({ onSignIn, onRegister, onError }) {
    return <AuthForm onSignIn={onSignIn} onRegister={onRegister} onError={onError} />
}

export default AuthPage
