import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    className?: string;
}

export default function VoiceInput({ onTranscript, className = '' }: VoiceInputProps) {
    const {
        interimTranscript,
        finalTranscript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (finalTranscript) {
            onTranscript(finalTranscript);
            resetTranscript();
        }
    }, [finalTranscript, onTranscript, resetTranscript]);

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all relative group ${listening
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-500'
                    }`}
                title={listening ? 'Stop Listening' : 'Start Voice Input'}
            >
                {listening ? (
                    <>
                        <Mic size={18} className="relative z-10" />
                        <motion.div
                            layoutId="node-pulse"
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 bg-red-500 rounded-2xl"
                        />
                    </>
                ) : (
                    <MicOff size={18} />
                )}
            </button>

            <AnimatePresence>
                {listening && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2"
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [8, 16, 8] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                    className="w-1 bg-red-500 rounded-full"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                                Venty is Listening...
                            </span>
                            {interimTranscript && (
                                <span className="text-[10px] text-slate-400 italic truncate max-w-[150px]">
                                    "{interimTranscript}"
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
