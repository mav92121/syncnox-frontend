"use client";

import React from "react";
import { Form, Input, Select, DatePicker, Checkbox, Row, Col } from "antd";
import dayjs from "dayjs";
import { CustomFieldDefinition } from "@/apis/custom-fields.api";
import { STANDARD_JOB_FIELD_KEYS } from "@/utils/jobs.utils";

interface DynamicCustomFieldsFormProps {
  customFields: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (updatedValues: Record<string, any>) => void;
  errors?: Record<string, string>;
  showHeading?: boolean;
  excludeKeys?: Set<string>;
}

export const DynamicCustomFieldsForm: React.FC<DynamicCustomFieldsFormProps> = ({
  customFields,
  values,
  onChange,
  errors = {},
  showHeading = false,
  excludeKeys,
}) => {
  if (!customFields || customFields.length === 0) return null;

  // Filter out custom field definitions that duplicate standard form controls OR are hidden in Dispatch Manager (disp === false)
  const additionalFields = customFields.filter((field) => {
    if (excludeKeys && excludeKeys.has(field.field_key)) return false;
    if (STANDARD_JOB_FIELD_KEYS.has(field.field_key)) return false;
    if (field.group === "optimization") return false;
    if (field.surfaces?.disp === false) return false;
    return true;
  });

  if (additionalFields.length === 0) return null;

  const handleFieldChange = (key: string, val: any) => {
    onChange({
      ...values,
      [key]: val,
    });
  };

  return (
    <div className="font-sans">
      {showHeading && (
        <div className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
          Custom Fields
        </div>
      )}

      <Row gutter={16}>
        {additionalFields.map((field) => {
          const val = values[field.field_key] ?? field.default_value ?? "";
          const error = errors[field.field_key];

          const optionsList = (field.options || []).map((opt: any) => ({
            label: String(opt),
            value: String(opt),
          }));

          return (
            <Col key={field.id} span={12}>
              <Form.Item
                label={
                  <span className="text-xs font-medium text-gray-800">
                    {field.label}
                  </span>
                }
                required={field.is_required}
                rules={
                  field.is_required
                    ? [{ required: true, message: `${field.label} is required` }]
                    : []
                }
                validateStatus={error ? "error" : undefined}
                help={error}
                className="mb-4"
              >
                {field.data_type === "select" ? (
                  <Select
                    value={val || undefined}
                    placeholder={`Select ${field.label}`}
                    options={optionsList}
                    onChange={(v) => handleFieldChange(field.field_key, v)}
                    className="w-full"
                    allowClear
                  />
                ) : field.data_type === "boolean" ? (
                  <div className="py-1">
                    <Checkbox
                      checked={Boolean(val)}
                      onChange={(e) => handleFieldChange(field.field_key, e.target.checked)}
                      className="text-xs text-gray-600"
                    >
                      {field.description || field.label}
                    </Checkbox>
                  </div>
                ) : field.data_type === "date" ? (
                  <DatePicker
                    value={val ? dayjs(val) : null}
                    onChange={(d, dateStr) =>
                      handleFieldChange(
                        field.field_key,
                        Array.isArray(dateStr) ? dateStr[0] : dateStr
                      )
                    }
                    format="DD-MM-YYYY"
                    className="w-full"
                  />
                ) : field.data_type === "number" ? (
                  <Input
                    type="number"
                    value={val}
                    onChange={(e) =>
                      handleFieldChange(
                        field.field_key,
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder={field.description || `Enter ${field.label}`}
                  />
                ) : (
                  <Input
                    type="text"
                    value={val}
                    onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                    placeholder={field.description || `Enter ${field.label}`}
                  />
                )}
              </Form.Item>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
