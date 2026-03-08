import { Toaster } from "react-hot-toast";

const Notification = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1c1c1c",
          color: "#f9f9f9",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#30b94d",
            secondary: "#f9f9f9",
          },
        },
        error: {
          iconTheme: {
            primary: "#e90516",
            secondary: "#f9f9f9",
          },
        },
      }}
    />
  );
};

export default Notification;
