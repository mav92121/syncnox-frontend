import { useState, useEffect } from "react";
import { Form, Button, Flex, Menu, message } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Team } from "@/types/team.type";
import {
  MENU_ITEMS,
  INITIAL_FORM_VALUES,
  MenuKey,
  TeamMemberFormProps,
} from "./teamMemberForm.types";
import { transformFormToApi, transformApiToForm } from "./teamMemberForm.utils";
import { useTeamStore } from "@/zustand/team.store";
import BasicInformation from "./BasicInformation";
import Skills from "./Skills";
import Cost from "./Cost";

const TeamMemberForm = ({
  initialData = null,
  onSubmit,
}: TeamMemberFormProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { createTeamAction, updateTeamAction, isLoading } = useTeamStore();
  const [form] = Form.useForm();
  const [activeSection, setActiveSection] = useState<MenuKey>("basic");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [scheduleBreak, setScheduleBreak] = useState(false);
  const [roleType, setRoleType] = useState<string>("driver");

  // Watch for role_type changes
  const onValuesChange = (changedValues: any) => {
    if (changedValues.role_type) {
      setRoleType(changedValues.role_type);
      // If changing from driver to non-driver, reset to basic section
      if (changedValues.role_type !== "driver" && activeSection !== "basic") {
        setActiveSection("basic");
      }
    }
  };

  const onFinish = async (values: any) => {
    console.log("Form submitted (raw)", values);

    const transformedValues = transformFormToApi(
      values,
      skills,
      scheduleBreak,
      initialData
    );

    console.log("Form submitted (transformed)", transformedValues);

    try {
      if (initialData?.id) {
        await updateTeamAction(transformedValues);
        messageApi.success("Team member updated successfully");
        form.resetFields();
        onSubmit?.();
      } else {
        await createTeamAction(transformedValues);
        messageApi.success("Team member created successfully");
        form.resetFields();
        onSubmit?.();
      }
    } catch (e: any) {
      const error = e;
      console.error(error?.detail);
      messageApi.error(error?.detail ?? "Something went wrong");
    }
  };

  // Prefill form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      const formValues = transformApiToForm(initialData);

      // Set role type
      if (initialData.role_type) {
        setRoleType(initialData.role_type);
      }

      // Set skills
      if (initialData.skills && Array.isArray(initialData.skills)) {
        setSkills(initialData.skills);
      }

      // Set schedule break flag
      if (initialData.break_time_start) {
        setScheduleBreak(true);
      }

      form.setFieldsValue(formValues);
    }
  }, [initialData, form]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const isDriver = roleType === "driver";

  // Filter menu items based on role - only show Basic Information for non-drivers
  const filteredMenuItems = isDriver
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.key === "basic");

  return (
    <Flex style={{ height: "100%", overflow: "hidden" }}>
      {contextHolder}

      {/* Left Sidebar Menu - always show but filter items based on role */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #f0f0f0",
          paddingRight: "12px",
          paddingTop: "12px",
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[activeSection]}
          onClick={({ key }) => setActiveSection(key as MenuKey)}
          items={filteredMenuItems}
          style={{
            border: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Right Content Area */}
      <Flex
        vertical
        style={{
          flex: 1,
          overflow: "hidden",
          paddingLeft: "12px",
        }}
      >
        {/* Scrollable Form Area */}
        <Flex
          vertical
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "8px",
          }}
          className="custom-scrollbar"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={onValuesChange}
            requiredMark={false}
            initialValues={INITIAL_FORM_VALUES}
          >
            {isDriver ? (
              <>
                {/* Render all sections for driver but hide inactive ones */}
                <div
                  style={{
                    display: activeSection === "basic" ? "block" : "none",
                  }}
                >
                  <BasicInformation
                    form={form}
                    scheduleBreak={scheduleBreak}
                    onScheduleBreakChange={setScheduleBreak}
                    isDriver={isDriver}
                  />
                </div>

                <div
                  style={{
                    display: activeSection === "skills" ? "block" : "none",
                  }}
                >
                  <Skills
                    skills={skills}
                    skillInput={skillInput}
                    onSkillInputChange={setSkillInput}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                  />
                </div>

                <div
                  style={{
                    display: activeSection === "cost" ? "block" : "none",
                  }}
                >
                  <Cost />
                </div>
              </>
            ) : (
              // For non-driver roles, show only basic information (first 5 fields)
              <BasicInformation
                form={form}
                scheduleBreak={scheduleBreak}
                onScheduleBreakChange={setScheduleBreak}
                isDriver={isDriver}
              />
            )}
          </Form>
        </Flex>

        {/* Fixed Button at Bottom */}
        <Flex style={{ paddingTop: "12px" }}>
          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            block
            icon={<PlusCircleOutlined />}
            onClick={() => form.submit()}
          >
            {initialData ? "Update" : "Add"}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TeamMemberForm;
