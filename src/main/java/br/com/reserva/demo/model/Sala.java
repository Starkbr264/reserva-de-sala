package br.com.reserva.demo.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "salas")
@JsonIgnoreProperties({"reservas", "chaves"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nome;

    private Integer capacidade;

    @Column(length = 100)
    private String tipo;

    @Column(length = 30)
    private String andar;

    @Column(length = 30)
    private String bloco;

    @Column(length = 30)
    private String statusManual;

    @Column(length = 250)
    private String motivoManual;

    @Column(length = 150)
    private String manualPor;

    @Column(name = "manual_criada_em")
    private LocalDateTime manualCriadaEm;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sala_turnos", joinColumns = @JoinColumn(name = "sala_id"))
    @Column(name = "turno")
    private List<String> turnosDisponiveis = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "unidade_id", nullable = false)
    @JsonIgnoreProperties({"usuarios", "salas"})
    private Unidade unidade;

    @OneToMany(mappedBy = "sala", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reserva> reservas = new ArrayList<>();

    @OneToMany(mappedBy = "sala", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Chave> chaves = new ArrayList<>();
}
