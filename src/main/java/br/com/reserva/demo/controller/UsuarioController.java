package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Usuario;
import br.com.reserva.demo.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Usuario> listar(
            @RequestParam(required = false) String perfil,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) String busca) {
        return service.listarComFiltros(perfil, unidadeId, busca);
    }

    @GetMapping("/{id}")
    public Usuario buscarPorId(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Usuario criar(@RequestBody Usuario usuario) {
        return service.salvar(usuario);
    }

    @PutMapping("/{id}")
    public Usuario atualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        return service.atualizar(id, usuario);
    }

    @PutMapping("/{id}/reset-senha")
    public void resetSenha(@PathVariable Long id, @RequestBody String novaSenha) {
        service.resetSenha(id, novaSenha.replace("\"", ""));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
