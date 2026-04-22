package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaRepository extends JpaRepository<Sala, Long> {

    List<Sala> findByUnidadeId(Long unidadeId);

    List<Sala> findByUnidadeIdAndTipoContainingIgnoreCase(Long unidadeId, String tipo);

    List<Sala> findByUnidadeIdAndNomeContainingIgnoreCase(Long unidadeId, String nome);

    List<Sala> findByUnidadeIdAndAndarContainingIgnoreCase(Long unidadeId, String andar);

    List<Sala> findByUnidadeIdAndBlocoContainingIgnoreCase(Long unidadeId, String bloco);
}