package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    List<Solicitacao> findByInstrutorId(Long instrutorId);
    List<Solicitacao> findByInstrutorUnidadeId(Long unidadeId);
    List<Solicitacao> findByStatus(String status); // pendente / aprovada / recusada
}