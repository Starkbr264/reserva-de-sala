package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findBySalaId(Long salaId);
    List<Reserva> findByTurmaId(Long turmaId);

    @Query("SELECT r FROM Reserva r WHERE r.sala.unidade.id = :unidadeId")
    List<Reserva> findByUnidadeIdCustom(@Param("unidadeId") Long unidadeId);

    // Verificação de conflitos (usado no Service)
    @Query("SELECT r FROM Reserva r WHERE r.sala.id = :salaId " +
            "AND r.turno = :turno " +
            "AND r.dataFim >= :dataInicio " +
            "AND r.dataInicio <= :dataFim")
    List<Reserva> findConflitos(@Param("salaId") Long salaId,
                                @Param("turno") String turno,
                                @Param("dataInicio") LocalDate dataInicio,
                                @Param("dataFim") LocalDate dataFim);
}