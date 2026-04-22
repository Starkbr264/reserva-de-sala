package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Unidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnidadeRepository extends JpaRepository<Unidade, Long> {

    List<Unidade> findByNomeContainingIgnoreCase(String nome);
    Optional<Unidade> findByNome(String nome);
}