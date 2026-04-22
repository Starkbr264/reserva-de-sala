package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Sala;
import br.com.reserva.demo.repository.SalaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalaService {

    private final SalaRepository repository;

    public SalaService(SalaRepository repository) {
        this.repository = repository;
    }

    public List<Sala> findAll() { return repository.findAll(); }

    public List<Sala> buscarPorUnidade(Long unidadeId) {
        return repository.findByUnidadeId(unidadeId);
    }

    public Sala salvar(Sala sala) {
        return repository.save(sala);
    }

    public Sala atualizar(Long id, Sala sala) {
        Sala existente = repository.findById(id).orElseThrow();
        existente.setNome(sala.getNome());
        existente.setCapacidade(sala.getCapacidade());
        existente.setTipo(sala.getTipo());
        existente.setAndar(sala.getAndar());
        existente.setBloco(sala.getBloco());
        existente.setTurnosDisponiveis(sala.getTurnosDisponiveis());
        existente.setUnidade(sala.getUnidade());
        existente.setStatusManual(sala.getStatusManual());
        existente.setMotivoManual(sala.getMotivoManual());
        existente.setManualPor(sala.getManualPor());
        existente.setManualCriadaEm(sala.getManualCriadaEm());
        return repository.save(existente);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
