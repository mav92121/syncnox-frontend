"use client";
import { Button, Typography } from "antd";
import { Rocket } from "lucide-react";

const { Title, Text } = Typography;

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="h-full flex bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg overflow-hidden">
      {/* Left side - Content */}
      <div className="flex-1 flex flex-col justify-center p-12 bg-white">
        <Text className="text-blue-500 font-semibold text-sm mb-3 uppercase tracking-wider">
          Getting Started
        </Text>

        <Title level={2} className="!m-0 !mb-4 !text-3xl">
          Welcome to Syncnox 🎉
        </Title>

        <Text className="text-base text-gray-500 leading-relaxed mb-2">
          We&apos;ll get you the most accurate, most efficient routes for all
          your drivers at once.
        </Text>

        <Text className="text-base text-gray-500 leading-relaxed mb-8">
          Just a few steps to set up your account.
        </Text>

        <Button
          type="primary"
          size="large"
          onClick={onStart}
          className="w-fit h-12 px-8 text-base font-medium"
        >
          Let&apos;s go
        </Button>
      </div>

      {/* Right side - Illustration */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
        {/* Abstract route visualization */}
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Route lines */}
            <path
              d="M50,200 Q100,100 200,150 T350,100"
              stroke="#4f9eff"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
            />
            <path
              d="M50,250 Q150,200 250,250 T350,200"
              stroke="#ff6b6b"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
            />
            <path
              d="M50,300 Q200,350 300,280 T350,320"
              stroke="#4ecdc4"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
            />
            {/* Location markers */}
            <circle cx="50" cy="200" r="8" fill="#4f9eff" />
            <circle cx="200" cy="150" r="8" fill="#4f9eff" />
            <circle cx="350" cy="100" r="8" fill="#4f9eff" />
            <circle cx="150" cy="250" r="8" fill="#ff6b6b" />
            <circle cx="300" cy="200" r="8" fill="#ff6b6b" />
            <circle cx="100" cy="300" r="8" fill="#4ecdc4" />
            <circle cx="280" cy="320" r="8" fill="#4ecdc4" />
          </svg>
        </div>

        {/* Central icon */}
        <div className="w-30 h-30 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center">
          <Rocket size={48} color="white" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
