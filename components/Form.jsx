"use client";

import {
  EmailOutlined,
  LockOutlined,
  PersonOutline,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react"

const Form = ({ type }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const onSubmit = async (data) => {
    if (type === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/");
      }

      if (res.error) {
        toast.error("Something went wrong");
      }
    }

    if (type === "login") {
      const res = await signIn("credentials", {
        ...data,
        redirect: false,
      })

      if (res.ok) {
        router.push("/work-hours");
      }

      if (res.error) {
        toast.error("Invalid email or password");
      }
    }
  };



  return (
    <div className="auth">
      <div className="content">
        <img src="https://upload.wikimedia.org/wikipedia/vi/2/2e/Dai_hoc_phu_yen_logo.png" alt="logo" className="logo" />

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {type === "register" && (
            <div>
              <div className="input">
                <input
                  defaultValue="admin@gmail.com"
                  {...register("username", {
                    required: "Username is required",
                    validate: (value) => {
                      if (value.length < 3) {
                        return "Username must be at least 3 characters";
                      }
                    },
                  })}
                  type="text"
                  placeholder="Username"
                  className="input-field"
                />
                <PersonOutline sx={{ color: "#737373" }} />
              </div>
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
              )}
            </div>
          )}

          <div>
            <div className="input">
              <input
                defaultValue="123456@"
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Email"
                className="input-field"
              />
              <EmailOutlined sx={{ color: "#737373" }} />
            </div>
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="input">
              <input
                defaultValue=""
                {...register("password", {
                  required: "Password is required",
                  validate: (value) => {
                    if (
                      value.length < 5 ||
                      !value.match(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/)
                    ) {
                      return "Password must be at least 5 characters and contain at least one special character";
                    }
                  },
                })}
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <LockOutlined sx={{ color: "#737373" }} />
            </div>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button className="button" type="submit">
            {type === "register" ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>

        {type === "register" ? (
          <Link href="/" className="link flex gap-1">
            <p className="text-center">Bạn đã có tài khoản? </p>
            <p className="text-red-400">Đăng nhập</p>
          </Link>
        ) : (
          <Link href="/register" className="link flex gap-1">
            <p className="text-center">Bạn chưa có tài khoản? </p>
            <p className="text-red-400">Đăng ký ngay</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Form;
