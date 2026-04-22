package br.com.reserva.demo.controller;

import br.com.reserva.demo.model.Reserva;
import br.com.reserva.demo.service.ReservaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Reserva> listar(@RequestParam(required = false) Long unidadeId) {
        return unidadeId != null ? service.buscarPorUnidade(unidadeId) : service.findAll();
    }

    @PostMapping
    public Reserva criar(@RequestBody Reserva reserva) {
        return service.salvar(reserva);
    }

    @PutMapping("/{id}")
    public Reserva atualizar(@PathVariable Long id, @RequestBody Reserva reserva) {
        return service.atualizar(id, reserva);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
