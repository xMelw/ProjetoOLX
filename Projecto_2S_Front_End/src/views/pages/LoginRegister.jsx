import { useEffect, useRef } from "react";

import LoginPart from "../parts/LoginPart";
import RegistePart from "../parts/RegisterPart";

const Login = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const registerBtn = container.querySelector(".register-btn");
    const loginBtn = container.querySelector(".login-btn");

    const handleRegister = () => container.classList.add("active");
    const handleLogin = () => container.classList.remove("active");

    registerBtn.addEventListener("click", handleRegister);
    loginBtn.addEventListener("click", handleLogin);

    return () => {
      registerBtn.removeEventListener("click", handleRegister);
      loginBtn.removeEventListener("click", handleLogin);
    };
  }, []);

  return (
    <>
    <div className="container position-relative overflow-hidden" ref={containerRef}>
      
      <LoginPart />
      <RegistePart />

      <div className="toggle-box position-absolute w-100 h-100">
        <div className="toggle-panel toggle-left">
          <h1>Bem-vindo!</h1>
          <p>Ainda não possui uma conta?</p>
          <button className="btn register-btn">Registe-se</button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Bem-vindo de volta!</h1>
          <p>Já possui uma conta?</p>
          <button className="btn login-btn">Login</button>
        </div>
      </div>
    </div>

    <style>
      {`
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(90deg, #FFF1EB, #EDFDF9);
        }

        .container {
          width: 850px;
          height: 550px;
          background: #fff;
          margin: 20px;
          border-radius: 30px;
          box-shadow: 0 0 30px rgba(0, 0, 0, .2);
        }

        .container h1 {
          font-size: 36px;
          margin: -10px 0;
        }

        .container p {
          font-size: 14.5px;
          margin: 15px 0;
        }

        .form-box {
          right: 0;
          background: #fff;
          text-align: center;
          padding: 40px;
          z-index: 1;
          transition: .6s ease-in-out 1.2s, visibility 0s 1s;
        }

        .container.active .form-box {
          right: 50%;
        }

        .form-box.register {
          visibility: hidden;
        }

        .container.active .form-box.register {
          visibility: visible;
        }

        .input-box {
          position: relative;
          margin: 30px 0;
        }

        .input-box input {
          width: 100%;
          padding: 13px 50px 13px 20px;
          background: #F5F5F5;
          border-radius: 8px;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 500;
        }

        .input-box input::placeholder {
          color: #888;
          font-weight: 400;
        }

        .input-box i {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
        }

        .forgot-link {
          margin: -15px 0 15px;
        }

        .forgot-link a {
          font-size: 14.5px;
        }

        .btn {
          width: 100%;
          height: 48px;
          background: #18DCAB;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, .1);
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #fff;
          font-weight: 600;
        }

        .toggle-box::before {
          content: '';
          position: absolute;
          left: -250%;
          width: 300%;
          height: 100%;
          background: #18DCAB;
          border-radius: 150px;
          z-index: 2;
          transition: 1.8s ease-in-out;
        }

        .container.active .toggle-box::before {
          left: 50%;
        }

        .toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 2;
          transition: .6s ease-in-out;
        }

        .toggle-panel.toggle-left {
          left: 0;
          transition-delay: 1.2s;
        }

        .container.active .toggle-panel.toggle-left {
          left: -50%;
          transition-delay: .6s;
        }

        .toggle-panel.toggle-right {
          right: -50%;
          transition-delay: .6s;
        }

        .container.active .toggle-panel.toggle-right {
          right: 0;
          transition-delay: 1.2s;
        }

        .toggle-panel p {
          margin-bottom: 20px;
        }

        .toggle-panel .btn {
          width: 160px;
          height: 46px;
          background: transparent;
          border: 2px solid #fff;
          box-shadow: none;
        }

        /* MEDIA QUERIES */

        @media screen and (max-width: 650px) {
          .container {
            height: calc(100vh - 40px);
          }

          .form-box {
            bottom: 0;
            width: 100%;
            height: 70%;
          }

          .container.active .form-box {
            right: 0;
            bottom: 30%;
          }

          .toggle-box::before {
            left: 0;
            top: -270%;
            width: 100%;
            height: 300%;
            border-radius: 20vw;
          }

          .container.active .toggle-box::before {
            left: 0;
            top: 70%;
          }

          .container.active .toggle-panel.toggle-left {
            left: 0;
            top: -30%;
          }

          .toggle-panel {
            width: 100%;
            height: 30%;
          }

          .toggle-panel.toggle-left {
            top: 0;
          }

          .toggle-panel.toggle-right {
            right: 0;
            bottom: -30%;
          }

          .container.active .toggle-panel.toggle-right {
            bottom: 0;
          }
        }

        @media screen and (max-width: 400px) {
          .form-box {
            padding: 20px;
          }

          .toggle-panel h1 {
            font-size: 30px;
          }
        }
      `}
          </style>
      </>
  );
};

export default Login;
