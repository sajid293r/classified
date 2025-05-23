"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradePage() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState("Personal");

    const plans = [
        {
            type: "Personal",
            name: "Free",
            price: "$0",
            period: "USD/month",
            description: "Explore how AI can help you with everyday tasks",
            features: [
                "Access to GPT-4o mini and reasoning",
                "Standard voice mode",
                "Real-time data from the web with search",
                "Limited access to GPT-4o and o4-mini",
                "Limited access to file uploads, advanced data analysis, and image generation",
                "Use custom GPTs",
            ],
            button: {
                text: "Your current plan",
                disabled: true,
                style: "bg-gray-300 text-gray-600 cursor-not-allowed",
            },
        },
        {
            type: "Personal",
            name: "Plus",
            price: "$20",
            period: "USD/month",
            description: "Level up productivity and creativity with expanded access",
            features: [
                "Everything in Free",
                "Extended limits on messaging, file uploads, advanced data analysis, and image generation",
                "Standard and advanced voice mode",
                "Access to deep research, multiple reasoning models (o4-mini, o4-mini-high, and o3), and a research preview of GPT-4.5",
                "Create and use tasks, projects, and custom GPTs",
                "Limited access to Sora video generation",
                "Opportunities to test new features",
            ],
            tag: "POPULAR",
            button: {
                text: "Get Plus",
                style: "bg-green-600 text-white hover:bg-green-700",
            },
        },
        {
            type: "Personal",
            name: "Pro",
            price: "$200",
            period: "USD/month",
            description: "Get the best of OpenAI with the highest level of access",
            features: [
                "Everything in Plus",
                "Unlimited access to all reasoning models and GPT-4o",
                "Unlimited access to advanced voice",
                "Extended access to deep research, which conducts multi-step online research for complex tasks",
                "Access to research previews of GPT-4.5 and Operator",
                "Access to o1 pro mode, which uses more compute for the best answers to the hardest questions",
                "Extended access to Sora video generation",
                "Access to a research preview of Codex agent",
            ],
            button: {
                text: "Get Pro",
                style: "bg-black text-white hover:bg-gray-900",
            },
        },
        {
            type: "Business",
            name: "Team",
            price: "$25",
            period: "USD/month",
            description: "Supercharge your team's work with a secure, collaborative workspace",
            features: [
                "Everything in Plus, with higher message limits for GPT-4o",
                "Customize ChatGPT to your workflows with file uploads, custom projects, GPTs, and persistent memory",
                "Delegate routine work to ChatGPT with tasks and solve complex problems with deep research, freeing your team for high-value work",
                "Create and innovate with multimodal AI—including Sora, image generation, canvas, and integrated coding tools",
                "Protect your data with multi-factor authentication, data encryption, and data excluded from training by default.",
                "Collaborate seamlessly with shared GPTs and an admin console for bulk user management",
            ],
            button: {
                text: "Get Team",
                style: "bg-black text-white hover:bg-gray-900",
            },
        },
    ];

    return (
        <div className="min-h-screen bg-white text-black px-4 py-10">
            <button
                onClick={() => router.push("/")}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl sm:text-2xl"
                aria-label="Close"
            >
                &times;
            </button>
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Upgrade your plan</h1>
                <div className="inline-flex rounded-full bg-gray-200 p-1 mb-8">
                    <button
                        onClick={() => setSelectedTab("Personal")}
                        className={`px-4 py-1 rounded-full text-sm font-medium ${selectedTab === "Personal" ? "bg-white shadow" : ""
                            }`}
                    >
                        Personal
                    </button>
                    <button
                        onClick={() => setSelectedTab("Business")}
                        className={`px-4 py-1 rounded-full text-sm font-medium ${selectedTab === "Business" ? "bg-white shadow" : ""
                            }`}
                    >
                        Business
                    </button>
                </div>
            </div>

            <div
                className={`grid ${selectedTab === "Business"
                        ? "grid-cols-1 justify-center max-w-sm"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl"
                    } mx-auto gap-6`}
            >
                {plans
                    .filter((plan) => plan.type === selectedTab)
                    .map((plan, index) => (
                        <div
                            key={index}
                            className={`w-full max-w-sm mx-auto rounded-xl border p-6 flex flex-col justify-between ${plan.tag ? "border-green-600" : "border-gray-300"
                                }`}
                        >
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-bold">{plan.name}</h2>
                                    {plan.tag && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                            {plan.tag}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-end mb-2">
                                    <span className="text-3xl font-semibold">{plan.price}</span>
                                    <span className="text-sm ml-1">{plan.period}</span>
                                </div>
                                <p className="text-sm mb-4 text-gray-700">{plan.description}</p>
                                <button
                                    className={`w-full rounded-full px-4 py-2 mt-2 text-sm font-medium ${plan.button.style}`}
                                    disabled={plan.button.disabled}
                                >
                                    {plan.button.text}
                                </button>
                                <ul className="text-sm space-y-2 mt-4">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="text-green-600 mr-2">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
            </div>

        </div>
    );
}

