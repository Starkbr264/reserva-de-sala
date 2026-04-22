package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Chave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChaveRepository extends JpaRepository<Chave, Long> {

    List<Chave> findBySalaId(Long salaId);
    List<Chave> findBySalaUnidadeId(Long unidadeId);
    List<Chave> findByStatus(String status); // "disponivel" ou "pega"
}