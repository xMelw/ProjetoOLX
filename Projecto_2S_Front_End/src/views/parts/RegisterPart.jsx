import useRegisterController from "../../controllers/useRegisterController";

const RegisterPart = () => {
  const { formData, setField, message, success, submitRegistration } = useRegisterController();
  return (
    <div className="form-box register overflow-y-auto max-h-full text-center position-absolute w-50 h-100">
      {success ? (
        <div className="flex flex-col justify-center items-center h-full p-4">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Registo submetido</h2>
          <p className="mb-4">{message}</p>
          <a href="/" className="btn w-auto px-6">Voltar ao site</a>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Registar</h1>
          <form onSubmit={submitRegistration} className="space-y-3">
            <div className="input-box"><input type="text" placeholder="Nome" value={formData.nome} onChange={(event) => setField("nome", event.target.value)} required /></div>
            <div className="input-box"><input type="email" placeholder="Email" value={formData.email} onChange={(event) => setField("email", event.target.value)} required /></div>
            <div className="input-box"><input type="password" placeholder="Palavra-passe" value={formData.password} onChange={(event) => setField("password", event.target.value)} minLength={8} required /></div>
            <div className="input-box"><input type="text" placeholder="Telemóvel" value={formData.telemovel} onChange={(event) => setField("telemovel", event.target.value)} required /></div>
            <button type="submit" className="btn">Registar</button>
          </form>
          {message && <p className={`mt-4 ${success ? "text-green-700" : "text-red-600"}`}>{message}</p>}
        </>
      )}
    </div>
  );
};

export default RegisterPart;