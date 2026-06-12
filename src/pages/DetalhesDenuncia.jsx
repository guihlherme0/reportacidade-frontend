import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import { Textarea } from "../components/Field";
import { api } from "../services/api";
import { formatDate, statusClass, statusLabel } from "../utils/formatters";

function DetalhesDenuncia({ id, user, onBack }) {
  const [denuncia, setDenuncia] = useState(null);
  const [imagemUrl, setImagemUrl] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [textoComentario, setTextoComentario] = useState("");
  const [erro, setErro] = useState("");
  const [erroComentario, setErroComentario] = useState("");
  const [sucessoComentario, setSucessoComentario] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [carregandoComentarios, setCarregandoComentarios] = useState(false);
  const [salvandoComentario, setSalvandoComentario] = useState(false);

  async function carregarComentarios() {
    try {
      setCarregandoComentarios(true);
      setErroComentario("");

      const resposta = await api.listarComentariosDenuncia(id);
      setComentarios(resposta.comentarios || []);
    } catch (error) {
      setErroComentario(error.message || "Erro ao carregar comentários.");
    } finally {
      setCarregandoComentarios(false);
    }
  }

  useEffect(() => {
    let urlCriada = null;

    async function carregarDenuncia() {
      try {
        setCarregando(true);
        setErro("");
        setErroComentario("");
        setSucessoComentario("");
        setComentarios([]);
        setTextoComentario("");

        const resposta = await api.buscarDenuncia(id);
        const denunciaCarregada = resposta.denuncia;

        setDenuncia(denunciaCarregada);

        if (denunciaCarregada?.foto_filename) {
          try {
            const blob = await api.buscarImagemDenuncia(id);
            urlCriada = URL.createObjectURL(blob);
            setImagemUrl(urlCriada);
          } catch {
            setImagemUrl(null);
          }
        } else {
          setImagemUrl(null);
        }

        await carregarComentarios();
      } catch (error) {
        setErro(error.message || "Erro ao carregar denúncia.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDenuncia();

    return () => {
      if (urlCriada) {
        URL.revokeObjectURL(urlCriada);
      }
    };
  }, [id]);

  async function enviarComentario(event) {
    event.preventDefault();

    const texto = textoComentario.trim();

    if (!texto) {
      return;
    }

    try {
      setSalvandoComentario(true);
      setErroComentario("");
      setSucessoComentario("");

      const resposta = await api.criarComentarioDenuncia(id, { texto });
      setComentarios((atuais) => [...atuais, resposta.comentario]);
      setTextoComentario("");
      setSucessoComentario("Comentário enviado.");
    } catch (error) {
      setErroComentario(error.message || "Erro ao enviar comentário.");
    } finally {
      setSalvandoComentario(false);
    }
  }

  if (carregando) {
    return (
      <div className="card p-6">
        <p className="text-nord-1">Carregando denúncia...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="card border-nord-11 bg-nord-11/10 p-6">
        <p className="text-red-600">{erro}</p>

        <button
          type="button"
          onClick={onBack}
          className="btn-secondary mt-4"
        >
          Voltar para denúncias
        </button>
      </div>
    );
  }

  if (!denuncia) {
    return (
      <div className="card p-6">
        <p className="text-nord-1">Denúncia não encontrada.</p>

        <button
          type="button"
          onClick={onBack}
          className="btn-secondary mt-4"
        >
          Voltar para denúncias
        </button>
      </div>
    );
  }

  const comentarioDisponivel =
    Boolean(textoComentario.trim()) && !salvandoComentario;
  const podeComentar =
    user?.tipo === "prefeitura" ||
    (user?.tipo === "usuario" &&
      String(denuncia.usuario_id) === String(user.id));

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="btn-secondary"
      >
        ← Voltar para denúncias
      </button>

      <section className="card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-nord-10">
              Detalhes da denúncia
            </p>
            <h1 className="mt-2 text-2xl font-black text-nord-0">
              {denuncia.tipo_problema}
            </h1>

            <p className="mt-2 text-sm text-nord-3">
              Denúncia #{denuncia.id}
            </p>
          </div>

          <span className={`badge w-fit ${statusClass(denuncia.status)}`}>
            {statusLabel(denuncia.status)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 text-sm text-nord-1 md:grid-cols-2">
          <p>
            <strong>Descrição:</strong> {denuncia.descricao}
          </p>

          <p>
            <strong>Endereço:</strong> {denuncia.endereco}
          </p>

          <p>
            <strong>Bairro:</strong> {denuncia.bairro}
          </p>

          <p>
            <strong>Cidade:</strong> {denuncia.cidade} - {denuncia.estado}
          </p>

          {denuncia.ponto_referencia && (
            <p>
              <strong>Ponto de referência:</strong>{" "}
              {denuncia.ponto_referencia}
            </p>
          )}

          {denuncia.data && (
            <p>
              <strong>Data:</strong> {formatDate(denuncia.data)}
            </p>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-xl font-black text-nord-0">
          Imagem enviada pelo cidadão
        </h2>

        {imagemUrl ? (
          <img
            src={imagemUrl}
            alt="Imagem da denúncia"
            className="max-h-[500px] w-full rounded-lg object-contain"
          />
        ) : (
          <p className="text-nord-3">
            Nenhuma imagem foi enviada nesta denúncia.
          </p>
        )}
      </section>

      <section className="card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-black text-nord-0">Comentários</h2>
          <span className="badge w-fit">{comentarios.length}</span>
        </div>

        {podeComentar ? (
          <form onSubmit={enviarComentario} className="mt-5 space-y-3">
            <Textarea
              label="Novo comentário"
              value={textoComentario}
              maxLength={1000}
              rows={4}
              placeholder={
                user?.tipo === "prefeitura"
                  ? "Atualização da prefeitura..."
                  : "Escreva sua mensagem..."
              }
              onChange={(event) => setTextoComentario(event.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-nord-3">
                {textoComentario.length}/1000
              </p>

              <button
                type="submit"
                disabled={!comentarioDisponivel}
                className="btn-primary"
              >
                {salvandoComentario ? "Enviando..." : "Enviar comentário"}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-4 space-y-3">
          <Alert type="error">{erroComentario}</Alert>
          <Alert type="success">{sucessoComentario}</Alert>
        </div>

        <div className="mt-6 space-y-3">
          {carregandoComentarios ? (
            <p className="text-sm text-nord-3">Carregando comentários...</p>
          ) : comentarios.length === 0 ? (
            <p className="text-sm text-nord-3">Nenhum comentário enviado.</p>
          ) : (
            comentarios.map((comentario) => (
              <ComentarioItem key={comentario.id} comentario={comentario} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ComentarioItem({ comentario }) {
  const prefeitura = comentario.autor_tipo === "prefeitura";
  const autorTipo = prefeitura ? "Prefeitura" : "Cidadão";
  const autorNome = comentario.autor_nome || autorTipo;

  return (
    <article
      className={`rounded-lg border p-4 ${
        prefeitura
          ? "border-nord-10 bg-nord-10/10"
          : "border-nord-4 bg-nord-6"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-bold text-nord-0">{autorNome}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-nord-3">
            {autorTipo}
          </p>
        </div>

        <time className="text-sm text-nord-3">
          {formatDate(comentario.data)}
        </time>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-nord-1">
        {comentario.texto}
      </p>
    </article>
  );
}

export default DetalhesDenuncia;
