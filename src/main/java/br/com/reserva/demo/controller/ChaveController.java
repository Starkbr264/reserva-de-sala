package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Chave;
import br.com.reserva.demo.service.ChaveService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chaves")
@CrossOrigin(origins = "*")
public class ChaveController {

    private final ChaveService service;

    public ChaveController(ChaveService service) {
        this.service = service;
    }

    @GetMapping
    public List<Chave> listar(@RequestParam(required = false) Long unidadeId) {
        return unidadeId != null ? service.buscarPorUnidade(unidadeId) : service.findAll();
    }

    @PostMapping
    public Chave criar(@RequestBody Chave chave) {
        return service.salvar(chave);
    }

    @PutMapping("/{id}")
    public Chave atualizar(@PathVariable Long id, @RequestBody Chave chave) {
        return service.atualizar(id, chave);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    @PostMapping("/{id}/retirar")
    public Chave retirar(@PathVariable Long id, @RequestBody Long instrutorId) {
        return service.retirar(id, instrutorId);
    }

    @PostMapping("/{id}/devolver")
    public Chave devolver(@PathVariable Long id) {
        return service.devolver(id);
    }
}
