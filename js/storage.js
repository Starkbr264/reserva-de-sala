/* ================================================================
   js/storage.js — Camada de dados  v2 (com seed completo)
   ================================================================ */
var _K = {
  usuarios:'sn_v4_usuarios', unidades:'sn_v4_unidades', salas:'sn_v4_salas',
  turmas:'sn_v4_turmas', reservas:'sn_v4_reservas', chaves:'sn_v4_chaves',
  notifs:'sn_v4_notifs', solics:'sn_v4_solics',
  sessao:'sn_v4_sessao', tema:'sn_v4_tema', init:'sn_v3_init',
};

var ADMIN_USER = {
  id:0, email:'Senac_GDF@Hotmail.com', senha:'Senac.DF2007',
  perfil:'admin', nome:'Administrador SENAC GDF', unidadeId:null
};

function _ld(k)   { try{return JSON.parse(localStorage.getItem(k))||[];}catch(e){return[];} }
function _ldO(k,d){ try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;} }
function _sv(k,v) { localStorage.setItem(k,JSON.stringify(v)); }
function newId()  { return Date.now()+Math.floor(Math.random()*9999); }
function hojeISO(){ return new Date().toISOString().split('T')[0]; }

function initDados() {
  if (localStorage.getItem(_K.init)) return;

  var unidades = [
    {id:1001, nome:'SENAC Asa Norte',     cep:'70750-500', cidade:'Brasília/DF',     endereco:'SGAN 609 Módulo D, Asa Norte'},
    {id:1002, nome:'SENAC Asa Sul',        cep:'70390-045', cidade:'Brasília/DF',     endereco:'CLS 314 Bloco A, Asa Sul'},
    {id:1003, nome:'SENAC Taguatinga',     cep:'72015-900', cidade:'Taguatinga/DF',   endereco:'QSD 10 Área Especial, Taguatinga Sul'},
    {id:1004, nome:'SENAC Ceilândia',      cep:'72220-270', cidade:'Ceilândia/DF',    endereco:'QNM 28 Área Especial, Ceilândia Norte'},
    {id:1005, nome:'SENAC Gama',           cep:'72405-080', cidade:'Gama/DF',         endereco:'Setor Central Lote 5, Gama'},
    {id:1006, nome:'SENAC Sobradinho',     cep:'73025-500', cidade:'Sobradinho/DF',   endereco:'Conjunto 5 Área Especial, Sobradinho I'},
    {id:1007, nome:'SENAC Planaltina',     cep:'73380-100', cidade:'Planaltina/DF',   endereco:'Setor Leste Área Especial, Planaltina'},
    {id:1008, nome:'SENAC Samambaia',      cep:'72301-080', cidade:'Samambaia/DF',    endereco:'QS 308 Conjunto 4, Samambaia Sul'},
    {id:1009, nome:'SENAC Santa Maria',    cep:'72503-503', cidade:'Santa Maria/DF',  endereco:'QR 103 Conjunto 4, Santa Maria'},
    {id:1010, nome:'SENAC Águas Claras',   cep:'71907-530', cidade:'Águas Claras/DF', endereco:'Rua das Orquídeas Lote 12, Águas Claras'},
  ];

  var coords = [
    {id:2001,nome:'Ana Paula Ferreira',  email:'coord.asanorte@senacdf.com',   senha:'Coord@123',perfil:'coordenador',unidadeId:1001},
    {id:2002,nome:'Bruno Mendes Costa',  email:'coord.asasul@senacdf.com',     senha:'Coord@123',perfil:'coordenador',unidadeId:1002},
    {id:2003,nome:'Carla Souza Lima',    email:'coord.taguatinga@senacdf.com', senha:'Coord@123',perfil:'coordenador',unidadeId:1003},
    {id:2004,nome:'Daniel Rocha Neves',  email:'coord.ceilandia@senacdf.com',  senha:'Coord@123',perfil:'coordenador',unidadeId:1004},
    {id:2005,nome:'Elaine Cristina Dias',email:'coord.gama@senacdf.com',       senha:'Coord@123',perfil:'coordenador',unidadeId:1005},
    {id:2006,nome:'Fábio Alves Santos',  email:'coord.sobradinho@senacdf.com', senha:'Coord@123',perfil:'coordenador',unidadeId:1006},
    {id:2007,nome:'Gabriela Moura',      email:'coord.planaltina@senacdf.com', senha:'Coord@123',perfil:'coordenador',unidadeId:1007},
    {id:2008,nome:'Henrique Lopes',      email:'coord.samambaia@senacdf.com',  senha:'Coord@123',perfil:'coordenador',unidadeId:1008},
    {id:2009,nome:'Isabela Ramos',       email:'coord.santamaria@senacdf.com', senha:'Coord@123',perfil:'coordenador',unidadeId:1009},
    {id:2010,nome:'João Victor Pinto',   email:'coord.aguasclaras@senacdf.com',senha:'Coord@123',perfil:'coordenador',unidadeId:1010},
  ];
  var instrutores = [
    {id:3001,nome:'Katia Regina Barros', email:'katia.barros@senacdf.com',    senha:'Inst@123',perfil:'instrutor',unidadeId:1001},
    {id:3002,nome:'Leonardo Cruz',       email:'leonardo.cruz@senacdf.com',   senha:'Inst@123',perfil:'instrutor',unidadeId:1002},
    {id:3003,nome:'Mariana Oliveira',    email:'mariana.oliveira@senacdf.com',senha:'Inst@123',perfil:'instrutor',unidadeId:1003},
    {id:3004,nome:'Natan Ferreira',      email:'natan.ferreira@senacdf.com',  senha:'Inst@123',perfil:'instrutor',unidadeId:1004},
    {id:3005,nome:'Olivia Martins',      email:'olivia.martins@senacdf.com',  senha:'Inst@123',perfil:'instrutor',unidadeId:1005},
    {id:3006,nome:'Pedro Henrique Melo', email:'pedro.melo@senacdf.com',      senha:'Inst@123',perfil:'instrutor',unidadeId:1006},
    {id:3007,nome:'Queila Nascimento',   email:'queila.nascimento@senacdf.com',senha:'Inst@123',perfil:'instrutor',unidadeId:1007},
    {id:3008,nome:'Rafael Torres',       email:'rafael.torres@senacdf.com',   senha:'Inst@123',perfil:'instrutor',unidadeId:1008},
    {id:3009,nome:'Sabrina Almeida',     email:'sabrina.almeida@senacdf.com', senha:'Inst@123',perfil:'instrutor',unidadeId:1009},
    {id:3010,nome:'Thiago Vieira',       email:'thiago.vieira@senacdf.com',   senha:'Inst@123',perfil:'instrutor',unidadeId:1010},
  ];
  var receps = [
    {id:4001,nome:'Úrsula Campos',   email:'recep.asanorte@senacdf.com',   senha:'Recep@123',perfil:'recepcao',unidadeId:1001},
    {id:4002,nome:'Vinícius Cardoso',email:'recep.asasul@senacdf.com',     senha:'Recep@123',perfil:'recepcao',unidadeId:1002},
    {id:4003,nome:'Wanda Silveira',  email:'recep.taguatinga@senacdf.com', senha:'Recep@123',perfil:'recepcao',unidadeId:1003},
    {id:4004,nome:'Xênia Prudente',  email:'recep.ceilandia@senacdf.com',  senha:'Recep@123',perfil:'recepcao',unidadeId:1004},
    {id:4005,nome:'Yara Gonçalves',  email:'recep.gama@senacdf.com',       senha:'Recep@123',perfil:'recepcao',unidadeId:1005},
    {id:4006,nome:'Zilda Fonseca',   email:'recep.sobradinho@senacdf.com', senha:'Recep@123',perfil:'recepcao',unidadeId:1006},
    {id:4007,nome:'Adriana Pereira', email:'recep.planaltina@senacdf.com', senha:'Recep@123',perfil:'recepcao',unidadeId:1007},
    {id:4008,nome:'Bernardo Castro', email:'recep.samambaia@senacdf.com',  senha:'Recep@123',perfil:'recepcao',unidadeId:1008},
    {id:4009,nome:'Cecília Duarte',  email:'recep.santamaria@senacdf.com', senha:'Recep@123',perfil:'recepcao',unidadeId:1009},
    {id:4010,nome:'Diego Farias',    email:'recep.aguasclaras@senacdf.com',senha:'Recep@123',perfil:'recepcao',unidadeId:1010},
  ];

  var salas = [
    // Asa Norte (1001) — Bloco A (Térreo) e Bloco B (1º/2º Andar)
    {id:5001,nome:'Lab 01',           capacidade:30, tipo:'Laboratório de Informática', andar:'Térreo',   bloco:'Bloco A', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1001},
    {id:5002,nome:'Sala A1',          capacidade:40, tipo:'Sala de Aula comum',         andar:'1º Andar', bloco:'Bloco A', turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1001},
    {id:5003,nome:'Auditório 1',      capacidade:100,tipo:'Auditório',                  andar:'Térreo',   bloco:'Bloco B', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1001},
    // Asa Sul (1002)
    {id:5004,nome:'Lab 02',           capacidade:25, tipo:'Laboratório de Informática', andar:'1º Andar', bloco:'Bloco Principal', turnos:['Matutino','Noturno'],              turnosDisponiveis:['Matutino','Noturno'],              unidadeId:1002},
    {id:5005,nome:'Sala B2',          capacidade:35, tipo:'Sala de Aula comum',         andar:'Térreo',   bloco:'Bloco Principal', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1002},
    {id:5006,nome:'Lab Gastronomia',  capacidade:20, tipo:'Laboratório de Gastronomia', andar:'2º Andar', bloco:'Bloco C',         turnos:['Vespertino'],                      turnosDisponiveis:['Vespertino'],                      unidadeId:1002},
    // Taguatinga (1003)
    {id:5007,nome:'Lab Info T01',     capacidade:30, tipo:'Laboratório de Informática', andar:'Térreo',   bloco:'Bloco A', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1003},
    {id:5008,nome:'Sala T02',         capacidade:40, tipo:'Sala de Aula comum',         andar:'1º Andar', bloco:'Bloco A', turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1003},
    {id:5009,nome:'Lab Estética T03', capacidade:15, tipo:'Laboratório de Estética',    andar:'2º Andar', bloco:'Bloco B', turnos:['Vespertino','Noturno'],            turnosDisponiveis:['Vespertino','Noturno'],            unidadeId:1003},
    // Ceilândia (1004)
    {id:5010,nome:'Sala C01',         capacidade:35, tipo:'Sala de Aula comum',         andar:'Térreo',   bloco:'Bloco A', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1004},
    {id:5011,nome:'Lab Enf C02',      capacidade:20, tipo:'Laboratório de Enfermagem',  andar:'1º Andar', bloco:'Bloco B', turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1004},
    {id:5012,nome:'Sala C03',         capacidade:30, tipo:'Sala de Aula comum',         andar:'2º Andar', bloco:'Bloco B', turnos:['Noturno'],                         turnosDisponiveis:['Noturno'],                         unidadeId:1004},
    // Gama (1005)
    {id:5013,nome:'Lab G01',          capacidade:25, tipo:'Laboratório de Informática', andar:'Térreo',   bloco:'Bloco Principal', turnos:['Matutino','Noturno'],              turnosDisponiveis:['Matutino','Noturno'],              unidadeId:1005},
    {id:5014,nome:'Sala G02',         capacidade:40, tipo:'Sala de Aula comum',         andar:'1º Andar', bloco:'Bloco Principal', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1005},
    {id:5015,nome:'Sala G03',         capacidade:35, tipo:'Sala de Reunião',            andar:'1º Andar', bloco:'Bloco A',         turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1005},
    // Sobradinho (1006)
    {id:5016,nome:'Lab S01',          capacidade:28, tipo:'Laboratório de Informática', andar:'Térreo',   bloco:'Bloco A', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1006},
    {id:5017,nome:'Sala S02',         capacidade:38, tipo:'Sala de Aula comum',         andar:'1º Andar', bloco:'Bloco A', turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1006},
    {id:5018,nome:'Sala S03 Video',   capacidade:30, tipo:'Sala de Videoconferência',   andar:'2º Andar', bloco:'Bloco B', turnos:['Matutino','Noturno'],              turnosDisponiveis:['Matutino','Noturno'],              unidadeId:1006},
    // Planaltina (1007)
    {id:5019,nome:'Sala P01',         capacidade:35, tipo:'Sala de Aula comum',         andar:'Térreo',   bloco:'Bloco Principal', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1007},
    {id:5020,nome:'Lab P02 Ciências', capacidade:22, tipo:'Laboratório de Ciências',    andar:'1º Andar', bloco:'Bloco Principal', turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1007},
    {id:5021,nome:'Sala P03',         capacidade:40, tipo:'Sala de Aula comum',         andar:'2º Andar', bloco:'Bloco B',         turnos:['Noturno'],                         turnosDisponiveis:['Noturno'],                         unidadeId:1007},
    // Samambaia (1008)
    {id:5022,nome:'Lab SM01',         capacidade:30, tipo:'Laboratório de Informática', andar:'Térreo',   bloco:'Bloco A', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1008},
    {id:5023,nome:'Sala SM02',        capacidade:40, tipo:'Sala de Aula comum',         andar:'1º Andar', bloco:'Bloco A', turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1008},
    {id:5024,nome:'Lab Gast SM03',    capacidade:18, tipo:'Laboratório de Gastronomia', andar:'Térreo',   bloco:'Bloco B', turnos:['Vespertino'],                      turnosDisponiveis:['Vespertino'],                      unidadeId:1008},
    // Santa Maria (1009)
    {id:5025,nome:'Sala SMA01',       capacidade:35, tipo:'Sala de Aula comum',         andar:'Térreo',   bloco:'Bloco Principal', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1009},
    {id:5026,nome:'Lab SMA02',        capacidade:25, tipo:'Laboratório de Informática', andar:'1º Andar', bloco:'Bloco Principal', turnos:['Matutino','Noturno'],              turnosDisponiveis:['Matutino','Noturno'],              unidadeId:1009},
    {id:5027,nome:'Sala SMA03',       capacidade:30, tipo:'Sala de Aula comum',         andar:'2º Andar', bloco:'Bloco A',         turnos:['Vespertino'],                      turnosDisponiveis:['Vespertino'],                      unidadeId:1009},
    // Águas Claras (1010)
    {id:5028,nome:'Lab AC01',         capacidade:30, tipo:'Laboratório de Informática', andar:'Térreo',   bloco:'Bloco A', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1010},
    {id:5029,nome:'Sala AC02',        capacidade:45, tipo:'Sala de Aula comum',         andar:'1º Andar', bloco:'Bloco A', turnos:['Matutino','Vespertino'],            turnosDisponiveis:['Matutino','Vespertino'],            unidadeId:1010},
    {id:5030,nome:'Auditório AC03',   capacidade:80, tipo:'Auditório',                  andar:'Térreo',   bloco:'Bloco B', turnos:['Matutino','Vespertino','Noturno'], turnosDisponiveis:['Matutino','Vespertino','Noturno'], unidadeId:1010},
  ];

  var hj = new Date();
  function ad(d){var dt=new Date(hj);dt.setDate(dt.getDate()+d);return dt.toISOString().split('T')[0];}
  function sd(d){var dt=new Date(hj);dt.setDate(dt.getDate()-d);return dt.toISOString().split('T')[0];}

  var turmas = [
    {id:6001,nome:'2025.01.101',curso:'Técnico em Informática',       turno:'Matutino',  dataInicio:sd(60),dataFim:ad(120),unidadeId:1001,instrutorId:3001},
    {id:6002,nome:'2025.02.102',curso:'Técnico em Administração',     turno:'Vespertino',dataInicio:sd(30),dataFim:ad(90), unidadeId:1001,instrutorId:3001},
    {id:6003,nome:'2025.03.103',curso:'Excel Avançado',               turno:'Noturno',   dataInicio:ad(10),dataFim:ad(50), unidadeId:1001,instrutorId:3001},
    {id:6004,nome:'2025.01.201',curso:'Gastronomia Básica',           turno:'Vespertino',dataInicio:sd(45),dataFim:ad(60), unidadeId:1002,instrutorId:3002},
    {id:6005,nome:'2025.02.202',curso:'Técnico em Redes',             turno:'Noturno',   dataInicio:sd(20),dataFim:ad(100),unidadeId:1002,instrutorId:3002},
    {id:6006,nome:'2025.03.203',curso:'Marketing Digital',            turno:'Matutino',  dataInicio:ad(5), dataFim:ad(45), unidadeId:1002,instrutorId:3002},
    {id:6007,nome:'2025.01.301',curso:'Técnico em Estética',          turno:'Vespertino',dataInicio:sd(90),dataFim:ad(30), unidadeId:1003,instrutorId:3003},
    {id:6008,nome:'2025.02.302',curso:'Programação Web',              turno:'Noturno',   dataInicio:sd(15),dataFim:ad(75), unidadeId:1003,instrutorId:3003},
    {id:6009,nome:'2025.03.303',curso:'Design Gráfico',               turno:'Matutino',  dataInicio:ad(20),dataFim:ad(80), unidadeId:1003,instrutorId:3003},
    {id:6010,nome:'2025.01.401',curso:'Técnico em Enfermagem',        turno:'Matutino',  dataInicio:sd(50),dataFim:ad(150),unidadeId:1004,instrutorId:3004},
    {id:6011,nome:'2025.02.402',curso:'Auxiliar Administrativo',      turno:'Noturno',   dataInicio:sd(10),dataFim:ad(60), unidadeId:1004,instrutorId:3004},
    {id:6012,nome:'2025.03.403',curso:'Segurança do Trabalho',        turno:'Vespertino',dataInicio:ad(15),dataFim:ad(90), unidadeId:1004,instrutorId:3004},
    {id:6013,nome:'2025.01.501',curso:'Técnico em Informática',       turno:'Matutino',  dataInicio:sd(40),dataFim:ad(80), unidadeId:1005,instrutorId:3005},
    {id:6014,nome:'2025.02.502',curso:'Gestão Financeira',            turno:'Noturno',   dataInicio:sd(25),dataFim:ad(55), unidadeId:1005,instrutorId:3005},
    {id:6015,nome:'2025.03.503',curso:'Liderança e Gestão de Equipes',turno:'Vespertino',dataInicio:ad(7), dataFim:ad(37), unidadeId:1005,instrutorId:3005},
    {id:6016,nome:'2025.01.601',curso:'Técnico em Redes',             turno:'Noturno',   dataInicio:sd(30),dataFim:ad(90), unidadeId:1006,instrutorId:3006},
    {id:6017,nome:'2025.02.602',curso:'Técnico em Administração',     turno:'Matutino',  dataInicio:sd(60),dataFim:ad(60), unidadeId:1006,instrutorId:3006},
    {id:6018,nome:'2025.03.603',curso:'Power BI e Análise de Dados',  turno:'Vespertino',dataInicio:ad(3), dataFim:ad(33), unidadeId:1006,instrutorId:3006},
    {id:6019,nome:'2025.01.701',curso:'Técnico em Biologia',          turno:'Matutino',  dataInicio:sd(70),dataFim:ad(50), unidadeId:1007,instrutorId:3007},
    {id:6020,nome:'2025.02.702',curso:'Auxiliar de Escritório',       turno:'Noturno',   dataInicio:sd(20),dataFim:ad(40), unidadeId:1007,instrutorId:3007},
    {id:6021,nome:'2025.03.703',curso:'Técnico em Logística',         turno:'Vespertino',dataInicio:ad(12),dataFim:ad(72), unidadeId:1007,instrutorId:3007},
    {id:6022,nome:'2025.01.801',curso:'Técnico em Informática',       turno:'Noturno',   dataInicio:sd(55),dataFim:ad(65), unidadeId:1008,instrutorId:3008},
    {id:6023,nome:'2025.02.802',curso:'Gastronomia Avançada',         turno:'Vespertino',dataInicio:sd(35),dataFim:ad(45), unidadeId:1008,instrutorId:3008},
    {id:6024,nome:'2025.03.803',curso:'Técnico em Administração',     turno:'Matutino',  dataInicio:ad(18),dataFim:ad(88), unidadeId:1008,instrutorId:3008},
    {id:6025,nome:'2025.01.901',curso:'Técnico em Informática',       turno:'Matutino',  dataInicio:sd(65),dataFim:ad(55), unidadeId:1009,instrutorId:3009},
    {id:6026,nome:'2025.02.902',curso:'Técnico em Contabilidade',     turno:'Noturno',   dataInicio:sd(40),dataFim:ad(80), unidadeId:1009,instrutorId:3009},
    {id:6027,nome:'2025.03.903',curso:'Recursos Humanos',             turno:'Vespertino',dataInicio:ad(9), dataFim:ad(49), unidadeId:1009,instrutorId:3009},
    {id:6028,nome:'2025.01.1001',curso:'Técnico em Informática',      turno:'Matutino',  dataInicio:sd(50),dataFim:ad(70), unidadeId:1010,instrutorId:3010},
    {id:6029,nome:'2025.02.1002',curso:'Técnico em Multimídia',       turno:'Vespertino',dataInicio:sd(25),dataFim:ad(95), unidadeId:1010,instrutorId:3010},
    {id:6030,nome:'2025.03.1003',curso:'Python para Iniciantes',      turno:'Noturno',   dataInicio:ad(6), dataFim:ad(36), unidadeId:1010,instrutorId:3010},
  ];

  var reservas = [
    {id:7001,salaId:5001,turmaId:6001,diasSemana:['seg','ter','qua','qui','sex'],turno:'Matutino',  dataInicio:sd(60),dataFim:ad(120),unidadeId:1001,status:'ATIVA'},
    {id:7002,salaId:5002,turmaId:6002,diasSemana:['seg','qua','sex'],            turno:'Vespertino',dataInicio:sd(30),dataFim:ad(90), unidadeId:1001,status:'ATIVA'},
    {id:7003,salaId:5001,turmaId:6003,diasSemana:['ter','qui'],                  turno:'Noturno',   dataInicio:ad(10),dataFim:ad(50), unidadeId:1001,status:'ATIVA'},
    {id:7004,salaId:5006,turmaId:6004,diasSemana:['seg','ter','qua'],            turno:'Vespertino',dataInicio:sd(45),dataFim:ad(60), unidadeId:1002,status:'ATIVA'},
    {id:7005,salaId:5004,turmaId:6005,diasSemana:['seg','ter','qua','qui','sex'],turno:'Noturno',   dataInicio:sd(20),dataFim:ad(100),unidadeId:1002,status:'ATIVA'},
    {id:7006,salaId:5005,turmaId:6006,diasSemana:['qua','qui','sex'],            turno:'Matutino',  dataInicio:ad(5), dataFim:ad(45), unidadeId:1002,status:'ATIVA'},
    {id:7007,salaId:5009,turmaId:6007,diasSemana:['seg','ter','qua','qui'],      turno:'Vespertino',dataInicio:sd(90),dataFim:ad(30), unidadeId:1003,status:'ATIVA'},
    {id:7008,salaId:5007,turmaId:6008,diasSemana:['seg','qua','sex'],            turno:'Noturno',   dataInicio:sd(15),dataFim:ad(75), unidadeId:1003,status:'ATIVA'},
    {id:7009,salaId:5008,turmaId:6009,diasSemana:['ter','qui'],                  turno:'Matutino',  dataInicio:ad(20),dataFim:ad(80), unidadeId:1003,status:'ATIVA'},
    {id:7010,salaId:5011,turmaId:6010,diasSemana:['seg','ter','qua','qui','sex'],turno:'Matutino',  dataInicio:sd(50),dataFim:ad(150),unidadeId:1004,status:'ATIVA'},
    {id:7011,salaId:5012,turmaId:6011,diasSemana:['seg','ter','qua'],            turno:'Noturno',   dataInicio:sd(10),dataFim:ad(60), unidadeId:1004,status:'ATIVA'},
    {id:7012,salaId:5010,turmaId:6012,diasSemana:['qua','qui','sex'],            turno:'Vespertino',dataInicio:ad(15),dataFim:ad(90), unidadeId:1004,status:'ATIVA'},
    {id:7013,salaId:5013,turmaId:6013,diasSemana:['seg','ter','qua','qui'],      turno:'Matutino',  dataInicio:sd(40),dataFim:ad(80), unidadeId:1005,status:'ATIVA'},
    {id:7014,salaId:5014,turmaId:6014,diasSemana:['seg','qua','sex'],            turno:'Noturno',   dataInicio:sd(25),dataFim:ad(55), unidadeId:1005,status:'ATIVA'},
    {id:7015,salaId:5015,turmaId:6015,diasSemana:['ter','qui','sab'],            turno:'Vespertino',dataInicio:ad(7), dataFim:ad(37), unidadeId:1005,status:'ATIVA'},
    {id:7016,salaId:5016,turmaId:6016,diasSemana:['seg','ter','qua','qui','sex'],turno:'Noturno',   dataInicio:sd(30),dataFim:ad(90), unidadeId:1006,status:'ATIVA'},
    {id:7017,salaId:5017,turmaId:6017,diasSemana:['seg','qua','sex'],            turno:'Matutino',  dataInicio:sd(60),dataFim:ad(60), unidadeId:1006,status:'ATIVA'},
    {id:7018,salaId:5018,turmaId:6018,diasSemana:['ter','qui'],                  turno:'Vespertino',dataInicio:ad(3), dataFim:ad(33), unidadeId:1006,status:'ATIVA'},
    {id:7019,salaId:5020,turmaId:6019,diasSemana:['seg','ter','qua','qui'],      turno:'Matutino',  dataInicio:sd(70),dataFim:ad(50), unidadeId:1007,status:'ATIVA'},
    {id:7020,salaId:5021,turmaId:6020,diasSemana:['seg','qua','sex'],            turno:'Noturno',   dataInicio:sd(20),dataFim:ad(40), unidadeId:1007,status:'ATIVA'},
    {id:7021,salaId:5019,turmaId:6021,diasSemana:['ter','qui','sab'],            turno:'Vespertino',dataInicio:ad(12),dataFim:ad(72), unidadeId:1007,status:'ATIVA'},
    {id:7022,salaId:5022,turmaId:6022,diasSemana:['seg','ter','qua','qui','sex'],turno:'Noturno',   dataInicio:sd(55),dataFim:ad(65), unidadeId:1008,status:'ATIVA'},
    {id:7023,salaId:5024,turmaId:6023,diasSemana:['seg','ter','qua'],            turno:'Vespertino',dataInicio:sd(35),dataFim:ad(45), unidadeId:1008,status:'ATIVA'},
    {id:7024,salaId:5023,turmaId:6024,diasSemana:['qua','qui','sex'],            turno:'Matutino',  dataInicio:ad(18),dataFim:ad(88), unidadeId:1008,status:'ATIVA'},
    {id:7025,salaId:5026,turmaId:6025,diasSemana:['seg','ter','qua','qui'],      turno:'Matutino',  dataInicio:sd(65),dataFim:ad(55), unidadeId:1009,status:'ATIVA'},
    {id:7026,salaId:5025,turmaId:6026,diasSemana:['seg','qua','sex'],            turno:'Noturno',   dataInicio:sd(40),dataFim:ad(80), unidadeId:1009,status:'ATIVA'},
    {id:7027,salaId:5027,turmaId:6027,diasSemana:['ter','qui'],                  turno:'Vespertino',dataInicio:ad(9), dataFim:ad(49), unidadeId:1009,status:'ATIVA'},
    {id:7028,salaId:5028,turmaId:6028,diasSemana:['seg','ter','qua','qui'],      turno:'Matutino',  dataInicio:sd(50),dataFim:ad(70), unidadeId:1010,status:'ATIVA'},
    {id:7029,salaId:5029,turmaId:6029,diasSemana:['seg','qua','sex'],            turno:'Vespertino',dataInicio:sd(25),dataFim:ad(95), unidadeId:1010,status:'ATIVA'},
    {id:7030,salaId:5028,turmaId:6030,diasSemana:['ter','qui'],                  turno:'Noturno',   dataInicio:ad(6), dataFim:ad(36), unidadeId:1010,status:'ATIVA'},
  ];

  var ts = hj.getTime();
  var chaves = [
    {id:8001,salaId:5001,codigo:'CH-001',andar:'1º Andar',status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1001},
    {id:8002,salaId:5002,codigo:'CH-002',andar:'1º Andar',status:'pega',      instrutorId:3001,pegaEm:new Date(ts-3600000).toISOString(),unidadeId:1001},
    {id:8003,salaId:5004,codigo:'CH-003',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1002},
    {id:8004,salaId:5006,codigo:'CH-004',andar:'2º Andar',status:'pega',      instrutorId:3002,pegaEm:new Date(ts-7200000).toISOString(),unidadeId:1002},
    {id:8005,salaId:5007,codigo:'CH-005',andar:'1º Andar',status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1003},
    {id:8006,salaId:5009,codigo:'CH-006',andar:'2º Andar',status:'pega',      instrutorId:3003,pegaEm:new Date(ts-1800000).toISOString(),unidadeId:1003},
    {id:8007,salaId:5010,codigo:'CH-007',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1004},
    {id:8008,salaId:5011,codigo:'CH-008',andar:'1º Andar',status:'pega',      instrutorId:3004,pegaEm:new Date(ts-5400000).toISOString(),unidadeId:1004},
    {id:8009,salaId:5013,codigo:'CH-009',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1005},
    {id:8010,salaId:5015,codigo:'CH-010',andar:'1º Andar',status:'pega',      instrutorId:3005,pegaEm:new Date(ts-2700000).toISOString(),unidadeId:1005},
    {id:8011,salaId:5016,codigo:'CH-011',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1006},
    {id:8012,salaId:5018,codigo:'CH-012',andar:'2º Andar',status:'pega',      instrutorId:3006,pegaEm:new Date(ts-9000000).toISOString(),unidadeId:1006},
    {id:8013,salaId:5019,codigo:'CH-013',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1007},
    {id:8014,salaId:5020,codigo:'CH-014',andar:'1º Andar',status:'pega',      instrutorId:3007,pegaEm:new Date(ts-4500000).toISOString(),unidadeId:1007},
    {id:8015,salaId:5022,codigo:'CH-015',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1008},
    {id:8016,salaId:5024,codigo:'CH-016',andar:'1º Andar',status:'pega',      instrutorId:3008,pegaEm:new Date(ts-6300000).toISOString(),unidadeId:1008},
    {id:8017,salaId:5025,codigo:'CH-017',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1009},
    {id:8018,salaId:5026,codigo:'CH-018',andar:'2º Andar',status:'pega',      instrutorId:3009,pegaEm:new Date(ts-3000000).toISOString(),unidadeId:1009},
    {id:8019,salaId:5028,codigo:'CH-019',andar:'Térreo',  status:'disponivel',instrutorId:null,pegaEm:null,unidadeId:1010},
    {id:8020,salaId:5030,codigo:'CH-020',andar:'2º Andar',status:'pega',      instrutorId:3010,pegaEm:new Date(ts-8100000).toISOString(),unidadeId:1010},
  ];

  _sv(_K.unidades, unidades);
  _sv(_K.usuarios, coords.concat(instrutores).concat(receps));
  _sv(_K.salas,    salas);
  _sv(_K.turmas,   turmas);
  _sv(_K.reservas, reservas);
  _sv(_K.chaves,   chaves);
  _sv(_K.notifs,   []);
  _sv(_K.solics,   []);
  localStorage.setItem(_K.init,'1');
}

/* ── SESSÃO ─────── */
function getSessao()   { return _ldO(_K.sessao,null); }
function setSessao(u)  { _sv(_K.sessao,u); }
function clearSessao() { localStorage.removeItem(_K.sessao); }

/* ── LOGIN ──────── */
function loginUser(email,senha) {
  if(email.trim().toLowerCase()===ADMIN_USER.email.toLowerCase()&&senha===ADMIN_USER.senha) return ADMIN_USER;
  return getUsuarios().find(function(u){return u.email.trim().toLowerCase()===email.trim().toLowerCase()&&u.senha===senha;})||null;
}

/* ── USUÁRIOS ───── */
function getUsuarios()         { return _ld(_K.usuarios); }
function setUsuarios(l)        { _sv(_K.usuarios,l); }
function getUserById(id)       { return getUsuarios().find(function(u){return u.id===id;})||null; }
function getUsuarioById(id)    { return getUserById(id); }
function getUsersByPerfil(p)   { return getUsuarios().filter(function(u){return u.perfil===p;}); }
function getUsuariosByPerfil(p){ return getUsersByPerfil(p); }
function addUser(u)            { u.id=newId();var l=getUsuarios();l.push(u);setUsuarios(l);return u; }
function addUsuario(u)         { return addUser(u); }
function updUser(id,d)         { var l=getUsuarios();var i=l.findIndex(function(u){return u.id===id;});if(i>-1)l[i]=Object.assign({},l[i],d);setUsuarios(l); }
function updUsuario(id,d)      { return updUser(id,d); }
function delUser(id)           { setUsuarios(getUsuarios().filter(function(u){return u.id!==id;})); }
function delUsuario(id)        { return delUser(id); }

/* ── UNIDADES ───── */
function getUnidades()         { return _ld(_K.unidades); }
function setUnidades(l)        { _sv(_K.unidades,l); }
function getUnidadeById(id)    { return getUnidades().find(function(u){return u.id===id;})||null; }
function addUnidade(u)         { u.id=newId();var l=getUnidades();l.push(u);setUnidades(l);return u; }
function updUnidade(id,d)      { var l=getUnidades();var i=l.findIndex(function(u){return u.id===id;});if(i>-1)l[i]=Object.assign({},l[i],d);setUnidades(l); }
function delUnidade(id)        { setUnidades(getUnidades().filter(function(u){return u.id!==id;})); }

/* ── SALAS ──────── */
function getSalas()            { return _ld(_K.salas); }
function setSalas(l)           { _sv(_K.salas,l); }
function getSalaById(id)       { return getSalas().find(function(s){return s.id===id;})||null; }
function getSalasByUnidade(uid){ return getSalas().filter(function(s){return s.unidadeId===uid;}); }
function addSala(s)            { s.id=newId();var l=getSalas();l.push(s);setSalas(l);return s; }
function updSala(id,d)         { var l=getSalas();var i=l.findIndex(function(s){return s.id===id;});if(i>-1)l[i]=Object.assign({},l[i],d);setSalas(l); }
function updateSala(id,d)      { return updSala(id,d); }
function delSala(id)           { setSalas(getSalas().filter(function(s){return s.id!==id;})); }
function deleteSala(id)        { return delSala(id); }

/* ── TURMAS ─────── */
function getTurmas()           { return _ld(_K.turmas); }
function setTurmas(l)          { _sv(_K.turmas,l); }
function getTurmaById(id)      { return getTurmas().find(function(t){return t.id===id;})||null; }
function addTurma(t)           { t.id=newId();var l=getTurmas();l.push(t);setTurmas(l);return t; }
function updTurma(id,d)        { var l=getTurmas();var i=l.findIndex(function(t){return t.id===id;});if(i>-1)l[i]=Object.assign({},l[i],d);setTurmas(l); }
function updateTurma(id,d)     { return updTurma(id,d); }
function delTurma(id)          { setTurmas(getTurmas().filter(function(t){return t.id!==id;})); }
function deleteTurma(id)       { return delTurma(id); }

function calcStatus(t) {
  var hj=new Date();hj.setHours(0,0,0,0);
  var ini=new Date(t.dataInicio+'T00:00:00');
  var fim=new Date(t.dataFim+'T00:00:00');
  var d30=new Date(hj);d30.setDate(d30.getDate()+30);
  if(fim<hj)  return 'encerrada';
  if(ini<=hj) return 'ativa';
  if(ini<=d30)return 'iminente';
  return 'posterior';
}
function labelStatus(st){ return {ativa:'Ativa',iminente:'Iminente',posterior:'Posterior',encerrada:'Encerrada'}[st]||st; }
function htmlStatus(t) { var st=calcStatus(t);return '<span class="st st-'+st+'">'+labelStatus(st)+'</span>'; }

/* ── RESERVAS ───── */
function getReservas()         { return _ld(_K.reservas); }
function setReservas(l)        { _sv(_K.reservas,l); }
function getReservaById(id)    { return getReservas().find(function(r){return r.id===id;})||null; }
function addReserva(r)         { r.id=newId();var l=getReservas();l.push(r);setReservas(l);return r; }
function updReserva(id,d)      { var l=getReservas();var i=l.findIndex(function(r){return r.id===id;});if(i>-1)l[i]=Object.assign({},l[i],d);setReservas(l); }
function delReserva(id)        { setReservas(getReservas().filter(function(r){return r.id!==id;})); }
function deleteReserva(id)     { return delReserva(id); }
function checarConflito(salaId,turno,dias,ini,fim,ignorarId) {
  var rs=getReservas().filter(function(r){return r.salaId===salaId&&r.turno===turno&&r.id!==ignorarId;});
  for(var i=0;i<rs.length;i++){
    var r=rs[i];var t=getTurmaById(r.turmaId);
    if(t&&calcStatus(t)==='encerrada')continue;
    if(fim<r.dataInicio||r.dataFim<ini)continue;
    var comuns=dias.filter(function(d){return r.diasSemana.includes(d);});
    if(comuns.length>0){var nm=t?t.nome:'?';return 'Conflito com "'+nm+'" nos dias '+comuns.map(function(d){return d.toUpperCase();}).join(', ')+'.';}
  }
  return null;
}
function verificarConflito(nova,ignorarId){ return checarConflito(nova.salaId,nova.turno,nova.diasSemana,nova.dataInicio,nova.dataFim,ignorarId||null); }

/* ── CHAVES ─────── */
function getChaves()           { return _ld(_K.chaves); }
function setChaves(l)          { _sv(_K.chaves,l); }
function getChaveById(id)      { return getChaves().find(function(c){return c.id===id;})||null; }
function addChave(c)           { c.id=newId();c.status='disponivel';var l=getChaves();l.push(c);setChaves(l);return c; }
function updChave(id,d)        { var l=getChaves();var i=l.findIndex(function(c){return c.id===id;});if(i>-1)l[i]=Object.assign({},l[i],d);setChaves(l); }
function delChave(id)          { setChaves(getChaves().filter(function(c){return c.id!==id;})); }

/* ── NOTIFS ─────── */
function getNotifs()           { return _ld(_K.notifs); }
function setNotifs(l)          { _sv(_K.notifs,l); }
function addNotif(n)           { n.id=newId();n.lida=false;n.criadaEm=new Date().toISOString();var l=getNotifs();l.unshift(n);setNotifs(l);return n; }
function getNotifsPara(perfil,uid){ return getNotifs().filter(function(n){return n.para===perfil||(Array.isArray(n.para)&&n.para.indexOf(perfil)>-1)||n.paraId===uid;}); }
function countNaoLidas(perfil,uid){ return getNotifsPara(perfil,uid).filter(function(n){return !n.lida;}).length; }
function marcarTodasLidas(perfil,uid){ var l=getNotifs().map(function(n){if(n.para===perfil||n.paraId===uid)n.lida=true;return n;});setNotifs(l); }

/* ── SOLICS ─────── */
function getSolics()           { return _ld(_K.solics); }
function setSolics(l)          { _sv(_K.solics,l); }
function addSolic(s)           { s.id=newId();s.status='pendente';s.criadaEm=new Date().toISOString();var l=getSolics();l.unshift(s);setSolics(l);return s; }
function updSolic(id,d)        { var l=getSolics();var i=l.findIndex(function(s){return s.id===id;});if(i>-1)l[i]=Object.assign({},l[i],d);setSolics(l); }

/* ── TEMA ───────── */
function getTema()   { return localStorage.getItem(_K.tema)||'light'; }
function setTema(t)  { localStorage.setItem(_K.tema,t);_aplicarTema(t); }
function toggleTema(){ setTema(getTema()==='dark'?'light':'dark'); }
function _aplicarTema(t){ document.documentElement.setAttribute('data-theme',t); }
function initTema()  { _aplicarTema(getTema()); }

/* ── UTILITÁRIOS ── */
function fmtData(iso){ if(!iso)return'—';var p=iso.split('-');return p[2]+'/'+p[1]+'/'+p[0]; }
function formatDate(iso){ return fmtData(iso); }
function fmtDateTime(iso){ if(!iso)return'—';var d=new Date(iso);return d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escapeHtml(s){ return esc(s); }
function iniciais(nome){ return (nome||'').split(' ').filter(Boolean).map(function(p){return p[0];}).join('').slice(0,2).toUpperCase(); }

function toast(msg,tipo){
  tipo=tipo||'ok';var c=document.getElementById('toasts');if(!c)return;
  var t=document.createElement('div');t.className='toast '+tipo;t.textContent=msg;c.appendChild(t);
  setTimeout(function(){t.style.animation='slideOut .3s ease forwards';setTimeout(function(){t.remove();},300);},3500);
}
function showToast(msg,tipo){ var map={success:'ok',error:'erro',warning:'aviso'};toast(msg,map[tipo]||tipo); }
function fmsg(elId,tipo,texto){ var el=document.getElementById(elId);if(!el)return;el.className='fmsg '+tipo;el.textContent=texto;el.style.display='block'; }
function fmsgHide(elId){ var el=document.getElementById(elId);if(!el)return;el.className='fmsg';el.style.display='none'; }
function showMsg(el,tipo,texto){ if(typeof el==='string'){fmsg(el,tipo,texto);return;}if(!el)return;var map={success:'ok',error:'erro',warning:'aviso'};el.className='fmsg '+(map[tipo]||tipo);el.textContent=texto;el.style.display='block'; }
function hideMsg(elId){ fmsgHide(elId); }

function modalAbrir(id){ var el=document.getElementById(id);if(!el)return;el.style.display='flex'; }
function modalFechar(id){ var el=document.getElementById(id);if(!el)return;el.style.display='none'; }

function initSidebar(){ var s=getSessao();var nEl=document.getElementById('sbNome');if(nEl&&s)nEl.textContent=s.nome;var iEl=document.getElementById('sbIniciais');if(iEl&&s)iEl.textContent=iniciais(s.nome); }
function initLogo(){ var img=document.getElementById('logoImg');if(img){img.onerror=function(){this.style.display='none';};} }
function _atualizarBadges(){}
function _atualizarBadge(){}
function sair(){ clearSessao();window.location.href='index.html'; }
function logout(){ sair(); }
function requirePerfil(p){ var s=getSessao();if(!s||s.perfil!==p){window.location.href='index.html';} }

function _tx(id,v){ var e=document.getElementById(id);if(e)e.textContent=v; }
function _vl(id,v){ var e=document.getElementById(id);if(e)e.value=v; }
function _gv(id)  { var e=document.getElementById(id);return e?e.value:''; }
