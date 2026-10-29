import { useState } from "react";
import useLoginController from "../../controllers/useLoginController";

const DEMO_PASSWORD = "AnunciosTuga123!";

const LoginPart = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { message, submitLogin } = useLoginController();

  const loginDemo = (demoEmail) => {
    submitLogin({ preventDefault: () => {} }, { email: demoEmail, password: DEMO_PASSWORD });
  };

  return (
    <>
    <div className="form-box login text-center position-absolute w-50 h-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={(event) => submitLogin(event, { email, password })} className="space-y-4">
        <div className="input-box"><input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="input-box"><input type="password" placeholder="Palavra-passe" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <button type="submit" className="btn">Entrar</button>
      </form>

      <div className="demo-login mt-4 gap-2 d-flex flex-column ">
        <p><i>ou experimenta com uma conta demo</i></p>
        <div className="d-flex flex-row gap-2 justify-content-between">
          <button type="button" className="button" onClick={() => loginDemo("ana@example.pt")}> Admin </button>
          <button type="button" className="button" onClick={() => loginDemo("miguel@example.pt")}> Utilizador </button>
        </div>
      </div>

      {message && <p className={`mt-4 ${message.includes("sucesso") ? "text-green-700" : "text-red-600"}`}>{message}</p>}
    </div>

    <style>
      {`
        .button{
          background-color: whitesmoke;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          width: 165px;
          height: 40px;
        }
      `}
    </style>

    </>
  );
};

export default LoginPart;