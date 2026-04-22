package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Unidade;
import br.com.reserva.demo.service.UnidadeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unidades")
@CrossOrigin
public class UnidadeController {

    private final UnidadeService service;

    public UnidadeController(UnidadeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Unidade> listar(@RequestParam(required = false) String nome) {
        return nome != null ? service.buscarPorNome(nome) : service.findAll();
    }

    @GetMapping("/{id}")
    public Unidade buscarPorId(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Unidade criar(@RequestBody Unidade unidade) {
        return service.salvar(unidade);
    }

    @PutMapping("/{id}")
    public Unidade atualizar(@PathVariable Long id, @RequestBody Unidade unidade) {
        return service.atualizar(id, unidade);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}