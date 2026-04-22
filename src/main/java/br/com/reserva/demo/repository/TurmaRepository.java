package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Long> {

    List<Turma> findByUnidadeId(Long unidadeId);
    List<Turma> findByInstrutorId(Long instrutorId);
    List<Turma> findByUnidadeIdAndTurno(Long unidadeId, String turno);
    List<Turma> findByUnidadeIdAndDataFimGreaterThanEqual(Long unidadeId, LocalDate data);
}