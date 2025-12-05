"use client";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const { Title } = Typography;

interface SignInFormValues {
  email: string;
  password: string;
}

export default function SignInPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  console.log(
    "temp env => ",
    process.env.NEXT_CHECK,
    process.env.NEXTAUTH_SECRET,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_NEXTAUTH_SECRET
  );

  // 🔍 Debug: Check environment variables accessible in browser
  console.log("🔍 [SIGN-IN PAGE] Environment Check:");
  console.log("  NEXT_PUBLIC_SERVER_URL:", process.env.NEXT_PUBLIC_SERVER_URL);
  console.log(
    "  Window location:",
    typeof window !== "undefined" ? window.location.href : "SSR"
  );

  const onFinish = async (values: SignInFormValues) => {
    try {
      console.log("🔍 [SIGN-IN] Attempting login for:", values.email);

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      console.log("🔍 [SIGN-IN] SignIn result:", {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url,
      });

      if (result?.error) {
        console.error("❌ [SIGN-IN] Authentication failed:", result.error);
        message.error("Invalid email or password");
        return;
      }

      if (result?.ok) {
        console.log("✅ [SIGN-IN] Login successful, redirecting to dashboard");
        message.success("Login successful!");
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("❌ [SIGN-IN] Login error:", error);
      message.error("An error occurred during login");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pt-24 gap-4"
      style={{ backgroundColor: "#F6FFED" }}
    >
      <div className="flex flex-col items-center gap-2">
        <img src="logo.svg" alt="Syncnox Logo" className="h-12 mb-4" />

        <Title level={2} className="text-gray-800 text-center">
          Sign in to Syncnox
        </Title>
      </div>

      {/* Sign In Card */}
      <Card className="w-full max-w-lg shadow-md">
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
