package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Notificacao;
import br.com.reserva.demo.repository.NotificacaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacaoService {

    private final NotificacaoRepository repository;

    public NotificacaoService(NotificacaoRepository repository) {
        this.repository = repository;
    }

    public List<Notificacao> buscarPorUsuario(Long usuarioId) {
        if (usuarioId == null) {
            return repository.findAll();
        }
        return repository.findByParaUsuarioId(usuarioId);
    }

    public Notificacao salvar(Notificacao notificacao) {
        if (notificacao.getCriadaEm() == null) {
            notificacao.setCriadaEm(LocalDateTime.now());
        }
        notificacao.setLida(false);
        return repository.save(notificacao);
    }

    public void marcarComoLida(Long id) {
        Notificacao n = repository.findById(id).orElseThrow();
        n.setLida(true);
        repository.save(n);
    }
}
