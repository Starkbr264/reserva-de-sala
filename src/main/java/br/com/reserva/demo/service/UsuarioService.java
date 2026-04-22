package br.com.reserva.demo.service;

import br.com.reserva.demo.model.Perfil;
import br.com.reserva.demo.model.Usuario;
import br.com.reserva.demo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario login(String email, String senha) {
        return repository.findByEmailIgnoreCase(email)
                .filter(u -> u.getSenha().equals(senha))
                .orElse(null);
    }

    public List<Usuario> findAll() {
        return repository.findAll();
    }

    public Usuario findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public List<Usuario> listarComFiltros(String perfilStr, Long unidadeId, String busca) {
        Perfil perfil = perfilStr != null ? Perfil.valueOf(perfilStr.toUpperCase()) : null;

        if (perfil != null && unidadeId != null) {
            return repository.findByPerfilAndUnidadeId(perfil, unidadeId);
        }
        if (perfil != null) {
            return repository.findByPerfil(perfil);
        }
        if (unidadeId != null) {
            return repository.findByUnidadeId(unidadeId);
        }
        if (busca != null && !busca.isBlank()) {
            return repository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(busca, busca);
        }
        return findAll();
    }

    public Usuario salvar(Usuario usuario) {
        return repository.save(usuario);
    }

    public Usuario atualizar(Long id, Usuario atualizado) {
        Usuario existente = repository.findById(id).orElseThrow();
        existente.setNome(atualizado.getNome());
        existente.setEmail(atualizado.getEmail());
        existente.setPerfil(atualizado.getPerfil());
        existente.setUnidade(atualizado.getUnidade());
        return repository.save(existente);
    }

    public void resetSenha(Long id, String novaSenha) {
        Usuario u = repository.findById(id).orElseThrow();
        u.setSenha(novaSenha);
        repository.save(u);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}