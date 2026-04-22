package br.com.reserva.demo.repository;

import br.com.reserva.demo.model.Perfil;
import br.com.reserva.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    List<Usuario> findByPerfil(Perfil perfil);

    List<Usuario> findByUnidadeId(Long unidadeId);

    List<Usuario> findByPerfilAndUnidadeId(Perfil perfil, Long unidadeId);

    List<Usuario> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(String nome, String email);
}