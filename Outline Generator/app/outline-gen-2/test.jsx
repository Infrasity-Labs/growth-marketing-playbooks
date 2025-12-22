import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Zap, Database, Code2, Sparkles } from 'lucide-react';
import { Typewriter } from "react-simple-typewriter";

// Mock components and functions for demonstration
const MockOutline = ({ data, onClose, onBack, inputTitle }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Generated Outline: {inputTitle}</h2>
            <div className="text-black mb-4">
                <p>Outline content would appear here...</p>
            </div>
            <div className="flex gap-2">
                <button onClick={onBack} className="px-4 py-2 bg-gray-500 text-white rounded">Back</button>
                <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded">Close</button>
            </div>
        </div>
    </div>
);

const MockQuestions = ({ data, onClose, setFinalOutline, cancelTwo, setSelectedSections, selectedSections }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Questions</h2>
            <div className="text-black mb-4">
                <p>Question interface would appear here...</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setFinalOutline({ title: "Sample Outline" })} className="px-4 py-2 bg-green-500 text-white rounded">
                    Generate Final Outline
                </button>
                <button onClick={cancelTwo} className="px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
            </div>
        </div>
    </div>
);

const MockLoaderWater = ({ loadingMessage }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-black">{loadingMessage}</p>
        </div>
    </div>
);

const MockReactTags = ({ selected, onAdd, onDelete, placeholderText, isDisabled, suggestions }) => (
    <div className="w-full">
        <input
            disabled={isDisabled}
            className="w-full bg-black/30 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base"
            placeholder={placeholderText}
        />
        <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((tag, index) => (
                <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                    {tag.value}
                    <button onClick={() => onDelete(index)} className="ml-2">×</button>
                </span>
            ))}
        </div>
    </div>
);

// Mock functions
const getIdTokenCookie = () => Promise.resolve("mock-token");
const getOutline = async (topic, model, difficulty, client, additionalInfo, userWorkPosition, userInterests, targetAudience, token) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { title: topic, content: "Generated outline..." };
};

const targetAudiences = [
    { value: "Web Developers", label: "Web Developers" },
    { value: "Coders", label: "Coders" },
    { value: "Software Developers", label: "Software Developers" },
];

export default function MergedOutlineGenerator() {
    // State from second component (functionality)
    const [topic, setTopic] = useState("");
    const [data, setData] = useState();
    const [model, setModel] = useState("gpt-4-0125-preview");
    const [client, setClient] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [loading, setLoading] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [loadingMessage, setLoadingMessage] = useState("");
    const [finalOutline, setFinalOutline] = useState(null);
    const [selectedTargetAudience, setSelectedTargetAudience] = useState([]);
    const [token, setIdToken] = useState();
    const [showDropDown, setShowDropDown] = useState(false);
    const [hoverButton, setHoverButton] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [selectedHeadings, setSelectedHeadings] = useState([]);

    // Background SVG from first component (design)
    const BackgroundSVG = () => (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 944 564"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full object-cover"
            preserveAspectRatio="xMidYMid slice"
            style={{
                animation: 'pulse-slow 4s ease-in-out infinite'
            }}
        >
            <g filter="url(#filter0_f_913_2290)">
                <path
                    d="M472 369.154C624.983 369.154 749 330.255 749 282.272C749 234.289 624.983 195.39 472 195.39C319.017 195.39 195 234.289 195 282.272C195 330.255 319.017 369.154 472 369.154Z"
                    fill="#232DE3"
                    style={{
                        animation: 'glow 6s ease-in-out infinite',
                        transformOrigin: 'center'
                    }}
                />
            </g>
            <defs>
                <filter id="filter0_f_913_2290" x="0.240005" y="0.630386" width="943.52" height="563.283" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="97.38" result="effect1_foregroundBlur_913_2290" />
                </filter>
            </defs>
        </svg>
    );

    // Loading messages from second component
    const messages = [
        "Initiating outline generation process...",
        "Analyzing provided information...",
        "Generating initial outline structure...",
        "Creating headings and subheadings...",
        "Compiling relevant data points...",
        "Refining content points for depth and accuracy...",
        "Completing quality assurance checks...",
        "Conducting final review for coherence and flow...",
        "Preparation complete. Finalizing...",
    ];

    let messageIndex = 0;

    const updateLoadingMessage = () => {
        setLoadingMessage(messages[messageIndex]);
        if (messageIndex === messages.length - 1) {
            return;
        }
        messageIndex = (messageIndex + 1) % messages.length;
    };

    // Effects from second component
    useEffect(() => {
        getIdTokenCookie()
            .then((res) => {
                setIdToken(res);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        const handleCreditsChecking = (event) => {
            setIsButtonDisabled(true);
            console.log("Credits remaining:", event.detail);
        };

        window.addEventListener("not-enough-credits", handleCreditsChecking);

        return () => {
            window.removeEventListener("not-enough-credits", handleCreditsChecking);
        };
    }, []);

    // Tag handling from second component
    const onAdd = useCallback(
        (newTag) => {
            setSelectedTargetAudience([...selectedTargetAudience, newTag]);
        },
        [selectedTargetAudience]
    );

    const onDelete = useCallback(
        (tagIndex) => {
            setSelectedTargetAudience(
                selectedTargetAudience.filter((_, i) => i !== tagIndex)
            );
        },
        [selectedTargetAudience]
    );

    // Form submission from second component
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        updateLoadingMessage();
        const intervalId = setInterval(() => {
            updateLoadingMessage();
        }, 5000);

        try {
            const targetAudience = selectedTargetAudience.map((audience) => audience.value);

            const outline = await getOutline(
                topic,
                model,
                difficulty,
                client,
                additionalInfo,
                "",
                [],
                targetAudience,
                token
            );

            clearInterval(intervalId);
            setLoading(false);
            setData(outline);
        } catch (error) {
            clearInterval(intervalId);
            console.error(error);
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFinalOutline(null);
        setData(undefined);
        setTopic("");
        setClient("");
        setAdditionalInfo("");
        setDifficulty("");
        setModel("gpt-4-0125-preview");
        setSelectedHeadings([]);
        setSelectedTargetAudience([]);
    };

    return (
        <div className="bg-black text-white py-10 relative overflow-hidden min-h-screen">
            {/* Global CSS for animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes pulse-slow {
                        0%, 100% { opacity: 0.4; }
                        50% { opacity: 0.9; }
                    }
                    
                    @keyframes glow {
                        0%, 100% { 
                            filter: brightness(0.8) saturate(0.9);
                            transform: scale(0.98);
                        }
                        50% { 
                            filter: brightness(1.3) saturate(1.3);
                            transform: scale(1.02);
                        }
                    }
                `
            }} />

            {/* Background SVG Container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-none">
                    <BackgroundSVG />
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-screen-xl mx-auto">
                {/* Header Badge */}
                <div className="mb-8 inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 sm:px-6 py-3 text-sm font-medium">
                    <Sparkles className="w-4 h-4 text-[#818cf8]" />
                    <span className="text-[#818cf8]">AI-Powered Outline Generator</span>
                </div>

                {/* Main Heading */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                        Generate Outlines
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#9a89fa] to-[#e079d1] bg-clip-text text-transparent">
                        with AI Assistance
                    </h2>

                    {/* Subtitle */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-300 text-base sm:text-lg">
                        <span>Let&apos;s create</span>
                        <span className="text-[#818cf8]">
                            <Typewriter
                                words={["comprehensive outlines", "structured content", "detailed frameworks", "organized guides", "professional documents"]}
                                cursor
                                loop={1000}
                                typeSpeed={100}
                                deleteSpeed={100}
                                delaySpeed={1000}
                            />
                        </span>
                        <span>together</span>
                    </div>
                </div>

                {/* Project Creation Form */}
                <div className="w-full max-w-4xl">
                    <div className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-[#3c4199ee] transition-colors duration-500 ease-in-out rounded-2xl p-4 sm:p-6 lg:p-8 shadow-[#232DE3] shadow-1xl">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <Sparkles className="w-4 h-4 text-[#818cf8]" />
                            <h3 className="text-lg sm:text-xl font-semibold">Generate Your Outline</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Topic Input */}
                            <div className="mb-4">
                                <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                                    Topic *
                                </label>
                                <input
                                    required
                                    disabled={isButtonDisabled}
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="E.g Bitcoin behind the scenes"
                                    className="w-full bg-black/30 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base"
                                />
                            </div>

                            {/* Additional Information */}
                            <div className="mb-4">
                                <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                                    Additional Information
                                </label>
                                <textarea
                                    disabled={isButtonDisabled}
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                    placeholder="E.g Tell about bitcoin focusing on the blockchain part of it"
                                    className="w-full h-20 bg-black/30 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base"
                                />
                            </div>

                            {/* Target Audience */}
                            <div className="mb-4">
                                <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                                    Target Audience
                                </label>
                                <div className="w-full bg-black/10 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus-within:outline-none focus-within:ring-[1px] focus-within:ring-[#3c4199ee] focus-within:border-transparent text-sm sm:text-base">

                                    <MockReactTags
                                        selected={selectedTargetAudience}
                                        onAdd={onAdd}
                                        onDelete={onDelete}
                                        placeholderText="E.g Web Developers, Coders, Software Developers"
                                        isDisabled={isButtonDisabled}
                                        suggestions={targetAudiences}
                                    />
                                </div>
                            </div>

                            {/* Client Name and Content Depth */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                                        Client Name
                                    </label>
                                    <input
                                        disabled={isButtonDisabled}
                                        type="text"
                                        value={client}
                                        onChange={(e) => setClient(e.target.value)}
                                        placeholder="E.g Google"
                                        className="w-full bg-black/30 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm sm:text-base text-gray-400 mb-2 font-medium">
                                        Content Depth
                                    </label>
                                    <div
                                        onClick={() => {
                                            if (!isButtonDisabled) setShowDropDown(!showDropDown);
                                        }}
                                        className={`w-full bg-black/30 border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-[1px] focus:ring-[#3c4199ee] focus:border-transparent text-sm sm:text-base cursor-pointer flex items-center justify-between ${isButtonDisabled ? 'cursor-not-allowed opacity-50' : ''
                                            }`}
                                    >
                                        <span className={!difficulty ? 'text-gray-400' : 'text-white'}>
                                            {difficulty || 'Select difficulty'}
                                        </span>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${showDropDown ? 'rotate-90' : ''}`} />
                                    </div>
                                    {showDropDown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded-xl shadow-lg z-10">
                                            {['Basic', 'Intermediate', 'Advanced'].map((level) => (
                                                <div
                                                    key={level}
                                                    onClick={() => {
                                                        setDifficulty(level);
                                                        setShowDropDown(false);
                                                    }}
                                                    className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white first:rounded-t-xl last:rounded-b-xl"
                                                >
                                                    {level}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isButtonDisabled || loading}
                                className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group text-sm sm:text-base ${isButtonDisabled || loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{loading ? 'Generating...' : 'Generate Outline'}</span>
                                {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Modal */}
            {loading && <MockLoaderWater loadingMessage={loadingMessage} />}

            {/* Questions Modal */}
            {data && !finalOutline && (
                <MockQuestions
                    data={data}
                    onClose={() => {
                        setData(undefined);
                        setSelectedHeadings([]);
                    }}
                    setFinalOutline={setFinalOutline}
                    cancelTwo={() => {
                        setData(undefined);
                        setTopic("");
                        setAdditionalInfo("");
                        setSelectedTargetAudience([]);
                        setClient("");
                        setDifficulty("");
                        setSelectedHeadings([]);
                    }}
                    setSelectedSections={setSelectedHeadings}
                    selectedSections={selectedHeadings}
                />
            )}

            {/* Final Outline Modal */}
            {finalOutline && (
                <MockOutline
                    data={finalOutline}
                    onClose={handleClose}
                    onBack={() => setFinalOutline(null)}
                    inputTitle={topic}
                />
            )}
        </div>
    );
}