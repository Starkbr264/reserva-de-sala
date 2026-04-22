package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findByParaUsuarioId(Long usuarioId);
    List<Notificacao> findByParaPerfil(String perfil);
    List<Notificacao> findByLidaFalse();
}