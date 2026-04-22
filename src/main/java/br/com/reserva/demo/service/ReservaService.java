package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Reserva;
import br.com.reserva.demo.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository repository;

    public ReservaService(ReservaRepository repository) {
        this.repository = repository;
    }

    public List<Reserva> findAll() { return repository.findAll(); }

    public List<Reserva> buscarPorUnidade(Long unidadeId) {
        return repository.findByUnidadeIdCustom(unidadeId);
    }

    public Reserva salvar(Reserva reserva) {
        validarConflito(reserva, null);
        reserva.setStatus(reserva.getStatus() == null || reserva.getStatus().isBlank() ? "ATIVA" : reserva.getStatus());
        return repository.save(reserva);
    }

    public Reserva atualizar(Long id, Reserva reservaAtualizada) {
        Reserva existente = repository.findById(id).orElseThrow(() -> new RuntimeException("Reserva não encontrada"));
        existente.setSala(reservaAtualizada.getSala());
        existente.setTurma(reservaAtualizada.getTurma());
        existente.setTurno(reservaAtualizada.getTurno());
        existente.setDiasSemana(reservaAtualizada.getDiasSemana());
        existente.setDataInicio(reservaAtualizada.getDataInicio());
        existente.setDataFim(reservaAtualizada.getDataFim());
        existente.setStatus(reservaAtualizada.getStatus() == null || reservaAtualizada.getStatus().isBlank() ? existente.getStatus() : reservaAtualizada.getStatus());
        validarConflito(existente, id);
        return repository.save(existente);
    }

    private void validarConflito(Reserva reserva, Long ignorarId) {
        var conflitos = repository.findConflitos(
                reserva.getSala().getId(),
                reserva.getTurno(),
                reserva.getDataInicio(),
                reserva.getDataFim());

        boolean temConflito = conflitos.stream().anyMatch(r -> ignorarId == null || !r.getId().equals(ignorarId));
        if (temConflito) {
            throw new RuntimeException("Conflito detectado com outra reserva para esta sala e turno.");
        }
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
