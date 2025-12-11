import { Input, Button, Row, Col, Flex, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface SkillsProps {
  skills: string[];
  skillInput: string;
  onSkillInputChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
}

const Skills = ({
  skills,
  skillInput,
  onSkillInputChange,
  onAddSkill,
  onRemoveSkill,
}: SkillsProps) => {
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-4">Skills</h3>
        <Row gutter={8}>
          <Col flex="auto">
            <Input
              placeholder="Add Skills"
              value={skillInput}
              onChange={(e) => onSkillInputChange(e.target.value)}
              onPressEnter={onAddSkill}
            />
          </Col>
          <Col>
            <Button onClick={onAddSkill}>Add</Button>
          </Col>
        </Row>
      </div>

      {/* Skills Display Area */}
      <div
        style={{
          minHeight: "200px",
          padding: "16px",
          backgroundColor: "#fafafa",
          borderRadius: "4px",
        }}
      >
        {skills.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#999", padding: "40px 0" }}
          >
            No skills added yet
          </div>
        ) : (
          <Flex gap="8px" wrap="wrap">
            {skills.map((skill) => (
              <Tag
                style={{
                  padding: "8px 20px",
                  gap: "8px",
                  display: "flex",
                  alignItems: "center",
                }}
                variant="outlined"
                key={skill}
                closable
                onClose={() => onRemoveSkill(skill)}
                closeIcon={<CloseOutlined />}
              >
                {skill}
              </Tag>
            ))}
          </Flex>
        )}
      </div>
    </>
  );
};

export default Skills;
