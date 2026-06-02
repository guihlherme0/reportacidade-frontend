import { useEffect, useState } from "react";
import { api } from "../services/api";
import { formatDate, statusClass, statusLabel } from "../utils/formatters";

function DetalhesDenuncia({ id, onBack }) {
  const [denuncia, setDenuncia] = useState(null);
  const [imagemUrl, setImagemUrl] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let urlCriada = null;

    async function carregarDenuncia() {
      try {
        setCarregando(true);
        setErro("");

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
        }
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
    </div>
  );
}

export default DetalhesDenuncia;
