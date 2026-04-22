package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Chave;
import br.com.reserva.demo.model.Usuario;
import br.com.reserva.demo.repository.ChaveRepository;
import br.com.reserva.demo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChaveService {

    private final ChaveRepository chaveRepository;
    private final UsuarioRepository usuarioRepository;

    public ChaveService(ChaveRepository chaveRepository, UsuarioRepository usuarioRepository) {
        this.chaveRepository = chaveRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Chave> findAll() {
        return chaveRepository.findAll();
    }

    public List<Chave> buscarPorUnidade(Long unidadeId) {
        return chaveRepository.findBySalaUnidadeId(unidadeId);
    }

    public Chave salvar(Chave chave) {
        chave.setStatus(chave.getStatus() == null || chave.getStatus().isBlank() ? "disponivel" : chave.getStatus());
        return chaveRepository.save(chave);
    }

    public Chave atualizar(Long id, Chave chaveAtualizada) {
        Chave existente = chaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chave não encontrada"));

        existente.setCodigo(chaveAtualizada.getCodigo());
        existente.setSala(chaveAtualizada.getSala());
        existente.setAndar(chaveAtualizada.getAndar());
        if (chaveAtualizada.getStatus() != null && !chaveAtualizada.getStatus().isBlank()) {
            existente.setStatus(chaveAtualizada.getStatus());
        }
        return chaveRepository.save(existente);
    }

    public void deletar(Long id) {
        chaveRepository.deleteById(id);
    }

    public Chave retirar(Long chaveId, Long instrutorId) {
        Chave chave = chaveRepository.findById(chaveId)
                .orElseThrow(() -> new RuntimeException("Chave não encontrada"));

        Usuario instrutor = usuarioRepository.findById(instrutorId)
                .orElseThrow(() -> new RuntimeException("Instrutor não encontrado"));

        chave.setStatus("pega");
        chave.setInstrutor(instrutor);
        chave.setPegaEm(LocalDateTime.now());

        return chaveRepository.save(chave);
    }

    public Chave devolver(Long chaveId) {
        Chave chave = chaveRepository.findById(chaveId)
                .orElseThrow(() -> new RuntimeException("Chave não encontrada"));

        chave.setStatus("disponivel");
        chave.setInstrutor(null);
        chave.setPegaEm(null);

        return chaveRepository.save(chave);
    }
}
