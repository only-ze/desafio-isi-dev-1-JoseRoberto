import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataState } from "./DataState";

describe("DataState", () => {
  it("mostra o carregamento", () => {
    render(
      <DataState loading error={null} empty={false} loadingLabel="Carregando jogadores...">
        <p>lista</p>
      </DataState>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Carregando jogadores...");
    expect(screen.queryByText("lista")).not.toBeInTheDocument();
  });

  it("mostra a lista vazia com a ação", () => {
    render(
      <DataState
        loading={false}
        error={null}
        empty
        emptyTitle="Nenhum clube cadastrado"
        emptyMessage="Crie o primeiro clube para começar."
        emptyAction={<button type="button">Novo clube</button>}
      >
        <p>lista</p>
      </DataState>,
    );
    expect(screen.getByText("Nenhum clube cadastrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo clube" })).toBeInTheDocument();
  });

  it("mostra o erro da API e tenta de novo", () => {
    const retry = vi.fn();
    render(
      <DataState
        loading={false}
        error="Não foi possível conectar à API."
        empty={false}
        errorTitle="Não foi possível carregar os jogadores"
        onRetry={retry}
      >
        <p>lista</p>
      </DataState>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível conectar à API.");
    fireEvent.click(screen.getByRole("button", { name: /Tentar de novo/ }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("mostra a recusa do filtro como aviso", () => {
    render(
      <DataState loading={false} error="Jogador não encontrado." empty={false} refusalTitle="O filtro foi recusado">
        <p>lista</p>
      </DataState>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("O filtro foi recusado");
    expect(screen.getByRole("alert")).toHaveTextContent("Jogador não encontrado.");
  });

  it("mostra o conteúdo quando há dados", () => {
    render(
      <DataState loading={false} error={null} empty={false}>
        <p>lista</p>
      </DataState>,
    );
    expect(screen.getByText("lista")).toBeInTheDocument();
  });
});
