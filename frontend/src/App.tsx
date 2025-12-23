import { Rocket } from 'lucide-react'

function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/50">
                        <Rocket size={48} className="text-white" />
                    </div>
                </div>
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    IdeaForge
                </h1>
                <p className="text-lg text-slate-400">
                    Transform your sparks into products. The ultimate AI-powered idea validator.
                </p>
                <div className="pt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App
