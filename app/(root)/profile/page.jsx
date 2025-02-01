"use client";

import Loader from "@components/Loader";
import { PersonOutline } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { CldUploadButton } from "next-cloudinary";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Table, Select, Progress, Input } from "antd";
import toast from "react-hot-toast";

const { Option } = Select;

const Profile = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (user) {
      reset({
        username: user?.username,
        profileImage: user?.profileImage,
      });
    }
    setLoading(false);
  }, [user]);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    control,
    formState: { error },
  } = useForm();

  const uploadPhoto = (result) => {
    const secureUrl = result?.info?.secure_url;

    if (secureUrl) {
      setValue("profileImage", secureUrl);
    } else {
      console.error("Ảnh tải lên không thành công hoặc không có URL");
    }
  };


  const updateUser = async (data) => {
    setLoading(true);
    try {
      // Remove khoa from the data before sending
      const { khoa, ...updateData } = data;
      
      const res = await fetch(`/api/users/${user._id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        toast.success("Cập nhật thông tin thành công!");
        // Redirect to home page
        if(user.role === 'admin'){
          window.location.href = "/admin";
        }else{
          window.location.href = "/work-hours";
        }
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Đã có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="profile-page bg-white w-[40%] rounded-md shadow-md mx-auto p-4">
      <h1 className="text-heading3-bold">CHỈNH SỬA THÔNG TIN</h1>

      <form className="edit-profile" onSubmit={handleSubmit(updateUser)}>
        <div className="input bg-white">
          <input
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
        {error?.username && (
          <p className="text-red-500">{error.username.message}</p>
        )}

        <div className="flex items-center justify-between">
          <img
            src={
              watch("profileImage") ||
              user?.profileImage ||
              "/assets/person.jpg"
            }
            alt="profile"
            className="w-40 h-40 rounded-full"
          />
          <CldUploadButton
            options={{ maxFiles: 1 }}
            onUpload={uploadPhoto}
            uploadPreset="e0rggou2"
          >
            <p className="text-body-bold ml-3">Upload new photo</p>
          </CldUploadButton>
        </div>

        <button className="btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
