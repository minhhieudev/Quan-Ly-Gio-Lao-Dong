'use client'
import { useState, useEffect } from "react";
import { Card, Button, Upload, message, Spin, Popconfirm } from "antd";
import { 
  DownloadOutlined, 
  UploadOutlined, 
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";

const BieuMauPage = () => {
  const [loading, setLoading] = useState(false);
  const [bieuMauList, setBieuMauList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBieuMau();
  }, []);

  const fetchBieuMau = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/bieu-mau', {
        method: 'GET',
      });
      if (res.ok) {
        const data = await res.json();
        setBieuMauList(data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách biểu mẫu");
    } finally {
      setLoading(false);
    }
  };

  // Hàm upload file
  const uploadFile = async (fileBlob) => {
    const formData = new FormData();
    formData.append('file', fileBlob, 'data-sv.xlsx');
    formData.append('upload_preset', 'e0rggou2');
    formData.append('source', 'uw');
    formData.append('api_key', 'YOUR_API_KEY');

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dpxcvonet/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload file: ${errorData.error.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const uploadResult = await uploadFile(file);
      
      // Lưu thông tin file vào database
      const fileData = {
        filename: file.name,
        url: uploadResult.secure_url,
        contentType: file.type,
        description: file.name.split('.')[0] // Mô tả mặc định là tên file
      };

      const res = await fetch('/api/admin/bieu-mau', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileData),
      });

      if (res.ok) {
        toast.success('Tải file lên thành công!');
        fetchBieuMau();
      }
    } catch (error) {
      toast.error('Lỗi khi tải file lên: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Thêm hàm xóa biểu mẫu
  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/admin/bieu-mau', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('Xóa biểu mẫu thành công!');
        fetchBieuMau();
      } else {
        toast.error('Lỗi khi xóa biểu mẫu');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa biểu mẫu');
    }
  };

  // Hàm xác định icon dựa trên loại file
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'xlsx':
      case 'xls':
        return <FileExcelOutlined style={{ fontSize: '32px', color: '#217346' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: '32px', color: '#FF4D4F' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: '32px', color: '#2B579A' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImageOutlined style={{ fontSize: '32px', color: '#4091F7' }} />;
      default:
        return <FileOutlined style={{ fontSize: '32px', color: '#8C8C8C' }} />;
    }
  };

  return (
    <div className="  bg-gradient-to-r from-blue-100 via-white to-blue-100 p-2 mt-2 h-[92vh] overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">BIỂU MẪU</h1>
          <Upload
            customRequest={({ file }) => handleFileUpload(file)}
            showUploadList={false}
          >
            <Button 
              icon={<UploadOutlined />}
              loading={uploading}
              className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
              size="large"
            >
              {uploading ? 'Đang tải lên...' : 'Tải lên biểu mẫu mới'}
            </Button>
          </Upload>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Spin size="large" />
          </div>
        ) : (
          <div className="flex-1 p-2">
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max max-h-[87%] overflow-auto"
            
            >
              {bieuMauList.map((bieuMau, index) => (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-all duration-300 border-t-4"
                  style={{
                    borderTopColor: 
                      bieuMau.filename.endsWith('xlsx') ? '#217346' :
                      bieuMau.filename.endsWith('pdf') ? '#FF4D4F' :
                      bieuMau.filename.endsWith('doc') || bieuMau.filename.endsWith('docx') ? '#2B579A' :
                      '#4091F7'
                  }}
                >
                  <div className="flex items-start gap-4">
                    {getFileIcon(bieuMau.filename)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 text-gray-800">
                        {bieuMau.filename}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">
                        {bieuMau.description || 'Không có mô tả'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(bieuMau.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadFile(bieuMau.url, bieuMau.filename)}
                      className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                    >
                      Tải xuống
                    </Button>
                    
                    <Popconfirm
                      title="Xóa biểu mẫu"
                      description="Bạn có chắc chắn muốn xóa biểu mẫu này?"
                      onConfirm={() => handleDelete(bieuMau._id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button 
                        danger
                        icon={<DeleteOutlined />}
                        className="flex items-center gap-2"
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BieuMauPage;
