"use client";
import { useState } from "react";
import { Button, Typography, message } from "antd";
import { ArrowRight, Plus, Trash2, User } from "lucide-react";
import TeamMemberForm from "@/app/team/_components/TeamMemberForm";
import { useTeamStore } from "@/zustand/team.store";

const { Text } = Typography;

interface TeamStepProps {
  onNext: () => void;
}

const TeamStep = ({ onNext }: TeamStepProps) => {
  const { teams } = useTeamStore();
  const [showForm, setShowForm] = useState(teams.length === 0);

  const handleTeamMemberAdded = () => {
    setShowForm(false);
    message.success("Team member added");
  };

  const handleContinue = () => {
    if (teams.length === 0) {
      message.error("Please add at least one team member");
      return;
    }
    onNext();
  };

  return (
    <div className="h-full p-3 flex flex-col">
      {/* Scrollable Content Area */}
      <div className="custom-scrollbar flex-1 overflow-auto pr-1">
        {/* Added Drivers List */}
        {teams.length > 0 && (
          <div className="mb-3">
            <Text strong className="block mb-2 text-[13px]">
              Added Drivers ({teams.length})
            </Text>
            {teams.map((member) => (
              <div
                key={member.id}
                className="py-2.5 px-3 bg-gray-50 mb-1.5 flex items-center gap-2"
              >
                <User size={14} />
                <span className="text-[13px]">{member.name}</span>
                <Text type="secondary" className="text-xs">
                  ({member.role_type})
                </Text>
              </div>
            ))}
          </div>
        )}

        {/* Team Member Form or Add Button */}
        {showForm ? (
          <div className="border border-gray-200">
            {/* Card Header with Close Button */}
            {teams.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
                <Text className="text-[13px] text-gray-600">New Driver</Text>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Cancel"
                >
                  <Trash2 size={14} className="text-red-500 cursor-pointer" />
                </button>
              </div>
            )}
            {/* Form Content */}
            <div className="p-3">
              <TeamMemberForm onSubmit={handleTeamMemberAdded} />
            </div>
          </div>
        ) : (
          <Button
            type="dashed"
            icon={<Plus size={14} />}
            onClick={() => setShowForm(true)}
            className="h-10 w-full"
          >
            Add {teams.length > 0 ? "another" : "a"} driver
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 flex justify-end shrink-0">
        <Button
          type="primary"
          onClick={handleContinue}
          disabled={teams.length === 0}
          icon={<ArrowRight size={14} />}
          iconPosition="end"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default TeamStep;
