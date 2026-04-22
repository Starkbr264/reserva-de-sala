package br.com.reserva.demo.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@Entity
@Table(name = "turmas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String curso;

    @Column(length = 20)
    private String turno;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @ManyToOne
    @JoinColumn(name = "instrutor_id")
    @JsonIgnoreProperties({"unidade", "senha"})
    private Usuario instrutor;

    @ManyToOne
    @JoinColumn(name = "unidade_id", nullable = false)
    @JsonIgnoreProperties({"usuarios", "salas"})
    private Unidade unidade;
}