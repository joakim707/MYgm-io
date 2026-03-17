import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (isRegister) {
      const { error } = await signUp(email, password, username);
      if (error) {
        setMessage(error);
        return;
      }
      setMessage("Compte cree avec succes. Connecte-toi.");
      setIsRegister(false);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      setMessage(error);
      return;
    }

    navigate("/");
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 24 }}>
      <h1>{isRegister ? "Creer un compte" : "Connexion"}</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {isRegister && (
          <input
            type="text"
            placeholder="Pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{isRegister ? "S'inscrire" : "Se connecter"}</button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      <button
        onClick={() => {
          setIsRegister(!isRegister);
          setMessage("");
        }}
        style={{ marginTop: 16 }}
      >
        {isRegister ? "J'ai deja un compte" : "Creer un compte"}
      </button>
    </div>
  );
}
