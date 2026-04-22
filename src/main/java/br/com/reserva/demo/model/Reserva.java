package br.com.reserva.demo.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sala_id", nullable = false)
    @JsonIgnoreProperties({"reservas", "chaves"})
    private Sala sala;

    @ManyToOne
    @JoinColumn(name = "turma_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Turma turma;

    @Column(length = 20)
    private String turno;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "reserva_dias", joinColumns = @JoinColumn(name = "reserva_id"))
    @Column(name = "dia")
    private List<String> diasSemana = new ArrayList<>();

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(length = 20)
    private String status; // ATIVA, CANCELADA
}