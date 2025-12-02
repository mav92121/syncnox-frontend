"use client";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { login } from "@/api/auth.api";

const { Title } = Typography;

interface SignInFormValues {
  email: string;
  password: string;
}

export default function SignInPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: SignInFormValues) => {
    const result = await login(values.email, values.password);

    // Handle error cases (401 or 500)
    if (result?.status === 401 || result?.status === 500) {
      message.error(result.message);
      return;
    }

    // Handle success case
    // Backend sets HTTP-only cookie automatically
    if (result?.user) {
      message.success("Login successful!");
      // Use setTimeout to allow message to display and cookie to be set
      router.replace("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pt-24 gap-4"
      style={{ backgroundColor: "#F6FFED" }}
    >
      <div className="flex flex-col items-center gap-2">
        <img src="logo.svg" alt="Syncnox Logo" className="h-12 mb-4" />

        <Title level={2} className="text-gray-800">
          Sign in to Syncnox
        </Title>
      </div>

      {/* Sign In Card */}
      <Card className="w-full max-w-md shadow-md">
        <Form
          requiredMark={false}
          form={form}
          name="signin"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="mt-2"
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
