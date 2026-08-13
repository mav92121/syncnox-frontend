import { useState, useEffect, useRef } from "react";
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
import { useTeamStore } from "@/store/team.store";
import { useDepotStore } from "@/store/depots.store";
import { saveDriverZones } from "@/apis/team.api";
import BasicInformation from "./BasicInformation";
import SkillsAndCost from "./SkillsAndCost";
import MobileAppSection from "./MobileAppSection";
import ServiceZonesSection from "./ServiceZonesSection";

const TeamMemberForm = ({
  initialData = null,
  onSubmit,
  isInline = false,
  form: externalForm,
}: TeamMemberFormProps & { isInline?: boolean; form?: any }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { createTeamAction, updateTeamAction, isLoading } = useTeamStore();
  const { depots } = useDepotStore();
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  const [activeSection, setActiveSection] = useState<MenuKey>("basic");
  const [zones, setZones] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [scheduleBreak, setScheduleBreak] = useState(true);
  const [roleType, setRoleType] = useState<string>("driver");
  const [startLocationSameAsDepot, setStartLocationSameAsDepot] =
    useState(true);
  const [endLocationSameAsDepot, setEndLocationSameAsDepot] = useState(true);

  const [startDepotId, setStartDepotId] = useState<number | undefined>(
    undefined
  );
  const [endDepotId, setEndDepotId] = useState<number | undefined>(undefined);

  // Auto-save ref
  const isPrefillingRef = useRef<boolean>(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSave = () => {
    if (!initialData?.id || isPrefillingRef.current) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      form
        .validateFields()
        .then(() => {
          form.submit();
        })
        .catch(() => {
          // Ignore validation errors during intermediate typing
        });
    }, 1000);
  };

  // Cleanup auto-save timer on unmount or initialData change
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [initialData?.id]);

  // Initialize depot IDs when depots are loaded
  useEffect(() => {
    if (depots.length > 0 && !startDepotId && !endDepotId && !initialData) {
      setStartDepotId(depots[0].id);
      setEndDepotId(depots[0].id);
    }
  }, [depots, initialData]);

  // Watch for role_type changes
  const onValuesChange = (changedValues: any) => {
    if (changedValues.role_type) {
      setRoleType(changedValues.role_type);
      // If changing from driver to non-driver, reset to basic section
      if (changedValues.role_type !== "driver" && activeSection !== "basic") {
        setActiveSection("basic");
      }
    }
    triggerAutoSave();
  };

  const onFinish = async (values: any) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const startDepot = depots.find((d) => d.id === startDepotId);
    const endDepot = depots.find((d) => d.id === endDepotId);

    const transformedValues = transformFormToApi(
      values,
      skills,
      scheduleBreak,
      initialData,
      {
        startLocationSameAsDepot,
        endLocationSameAsDepot,
        startDepot,
        endDepot,
      }
    );

    try {
      if (initialData?.id) {
        await updateTeamAction(transformedValues);
        if (roleType === "driver") {
          try {
            await saveDriverZones(initialData.id, zones);
          } catch (zoneError) {
            console.error("Failed to save service zones:", zoneError);
            messageApi.error("Failed to save service zones");
          }
        }
        messageApi.success("Team member saved successfully");
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
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    if (initialData) {
      isPrefillingRef.current = true;
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

      // Check if start/end location matches any depot
      let matchingStartDepot = depots[0];
      let matchingEndDepot = depots[0];

      if (initialData.start_address) {
        const found = depots.find(
          (d) => d.address?.formatted_address === initialData.start_address
        );
        if (found) {
          matchingStartDepot = found;
        }
      }

      const isStartSameAsDepot =
        !initialData.start_address ||
        (!!matchingStartDepot &&
          initialData.start_address ===
            matchingStartDepot.address?.formatted_address);

      if (initialData.end_address) {
        const found = depots.find(
          (d) => d.address?.formatted_address === initialData.end_address
        );
        if (found) {
          matchingEndDepot = found;
        }
      }

      const isEndSameAsDepot =
        !initialData.end_address ||
        (!!matchingEndDepot &&
          initialData.end_address ===
            matchingEndDepot.address?.formatted_address);

      setStartLocationSameAsDepot(isStartSameAsDepot);
      setEndLocationSameAsDepot(isEndSameAsDepot);

      if (matchingStartDepot) {
        setStartDepotId(matchingStartDepot.id);
      }
      if (matchingEndDepot) {
        setEndDepotId(matchingEndDepot.id);
      }

      form.setFieldsValue(formValues);
      setTimeout(() => {
        isPrefillingRef.current = false;
      }, 500);
    }
  }, [initialData, form, depots]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
      triggerAutoSave();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
    triggerAutoSave();
  };

  const isDriver = roleType === "driver";

  const menuItems = [
    { key: "basic", label: "Basic Information" },
    { key: "skillsAndCost", label: "Costs & Skills (Optional)" },
    { key: "serviceZones", label: "Service Areas" },
    { key: "mobileApp", label: "Mobile App" },
  ];

  const filteredMenuItems = isDriver
    ? menuItems
    : menuItems.filter((item) => item.key === "basic");

  return (
    <Flex style={{ height: isInline ? "auto" : "100%", overflow: isInline ? "visible" : "hidden" }}>
      {contextHolder}

      {/* Left Sidebar Menu - always show but filter items based on role */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #f0f0f0",
          paddingRight: "8px",
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
          overflow: isInline ? "visible" : "hidden",
          paddingLeft: "12px",
        }}
      >
        {/* Scrollable Form Area */}
        <Flex
          vertical
          style={{
            flex: 1,
            overflowY: isInline ? "visible" : "auto",
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
                    onScheduleBreakChange={(val) => {
                      setScheduleBreak(val);
                      triggerAutoSave();
                    }}
                    isDriver={isDriver}
                    startLocationSameAsDepot={startLocationSameAsDepot}
                    onStartLocationSameAsDepotChange={(val) => {
                      setStartLocationSameAsDepot(val);
                      triggerAutoSave();
                    }}
                    endLocationSameAsDepot={endLocationSameAsDepot}
                    onEndLocationSameAsDepotChange={(val) => {
                      setEndLocationSameAsDepot(val);
                      triggerAutoSave();
                    }}
                    startDepotId={startDepotId}
                    setStartDepotId={(val) => {
                      setStartDepotId(val);
                      triggerAutoSave();
                    }}
                    endDepotId={endDepotId}
                    setEndDepotId={(val) => {
                      setEndDepotId(val);
                      triggerAutoSave();
                    }}
                  />
                </div>

                <div
                  style={{
                    display:
                      activeSection === "skillsAndCost" ? "block" : "none",
                  }}
                >
                  <SkillsAndCost
                    skills={skills}
                    skillInput={skillInput}
                    onSkillInputChange={setSkillInput}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                  />
                </div>

                <div
                  style={{
                    display:
                      activeSection === "serviceZones" ? "block" : "none",
                  }}
                >
                  <ServiceZonesSection
                    driverId={initialData?.id}
                    zones={zones}
                    onZonesChange={(newZones, isUserEdit = true) => {
                      setZones(newZones);
                      if (isUserEdit) {
                        triggerAutoSave();
                      }
                    }}
                  />
                </div>

                <div
                  style={{
                    display:
                      activeSection === "mobileApp" ? "block" : "none",
                  }}
                >
                  <MobileAppSection
                    driverId={initialData?.id}
                    initialActivationCode={initialData?.activation_code}
                  />
                </div>
              </>
            ) : (
              // For non-driver roles, show only basic information (first 5 fields)
              <BasicInformation
                form={form}
                scheduleBreak={scheduleBreak}
                onScheduleBreakChange={(val) => {
                  setScheduleBreak(val);
                  triggerAutoSave();
                }}
                isDriver={isDriver}
                startLocationSameAsDepot={startLocationSameAsDepot}
                onStartLocationSameAsDepotChange={(val) => {
                  setStartLocationSameAsDepot(val);
                  triggerAutoSave();
                }}
                endLocationSameAsDepot={endLocationSameAsDepot}
                onEndLocationSameAsDepotChange={(val) => {
                  setEndLocationSameAsDepot(val);
                  triggerAutoSave();
                }}
                startDepotId={startDepotId}
                setStartDepotId={(val) => {
                  setStartDepotId(val);
                  triggerAutoSave();
                }}
                endDepotId={endDepotId}
                setEndDepotId={(val) => {
                  setEndDepotId(val);
                  triggerAutoSave();
                }}
              />
            )}
          </Form>
        </Flex>

        {/* Fixed Button at Bottom (hidden when inline, as save button is in top header) */}
        {!isInline && (
          <Flex style={{ paddingTop: "12px" }}>
            <Button
              loading={isLoading}
              type="primary"
              htmlType="submit"
              block
              icon={<PlusCircleOutlined />}
              onClick={() => form.submit()}
            >
              {initialData ? "Save" : "Add"}
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default TeamMemberForm;
