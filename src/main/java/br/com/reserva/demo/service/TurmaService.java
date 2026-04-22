package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Turma;
import br.com.reserva.demo.repository.TurmaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TurmaService {

    private final TurmaRepository repository;

    public TurmaService(TurmaRepository repository) {
        this.repository = repository;
    }

    public List<Turma> findAll() { return repository.findAll(); }

    public List<Turma> buscarPorUnidade(Long unidadeId) {
        return repository.findByUnidadeId(unidadeId);
    }

    public String calcularStatus(Turma t) {
        LocalDate hoje = LocalDate.now();
        if (t.getDataFim().isBefore(hoje)) return "encerrada";
        if (!t.getDataInicio().isAfter(hoje)) return "ativa";
        if (t.getDataInicio().isBefore(hoje.plusDays(30))) return "iminente";
        return "posterior";
    }

    public Turma salvar(Turma turma) {
        return repository.save(turma);
    }

    public Turma atualizar(Long id, Turma turma) {
        Turma existente = repository.findById(id).orElseThrow();
        existente.setCodigo(turma.getCodigo());
        existente.setCurso(turma.getCurso());
        existente.setTurno(turma.getTurno());
        existente.setDataInicio(turma.getDataInicio());
        existente.setDataFim(turma.getDataFim());
        existente.setInstrutor(turma.getInstrutor());
        return repository.save(existente);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}