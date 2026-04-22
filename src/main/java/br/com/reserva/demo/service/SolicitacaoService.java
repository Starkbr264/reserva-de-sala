package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Solicitacao;
import br.com.reserva.demo.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository repository;

    public SolicitacaoService(SolicitacaoRepository repository) {
        this.repository = repository;
    }

    public List<Solicitacao> buscarPorUnidade(Long unidadeId) {
        if (unidadeId == null) {
            return repository.findAll();
        }
        return repository.findByInstrutorUnidadeId(unidadeId);
    }

    public Solicitacao salvar(Solicitacao s) {
        s.setStatus("pendente");
        return repository.save(s);
    }

    public Solicitacao aprovar(Long id) {
        Solicitacao s = repository.findById(id).orElseThrow();
        s.setStatus("aprovada");
        return repository.save(s);
    }

    public Solicitacao recusar(Long id) {
        Solicitacao s = repository.findById(id).orElseThrow();
        s.setStatus("recusada");
        return repository.save(s);
    }
}
