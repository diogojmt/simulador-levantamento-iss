// Declaração da variável currentPeriod no escopo global
let currentPeriod = "12/2018";  // Inicia o período com "01/2019"
const TAXA_JUROS_MORA_DIA = 0.0033;  // 0,33% ao dia
const LIMITE_JUROS_MORA = 0.20;  // Limite de 20% sobre a Diferença Atualizada
const TAXA_MULTA_MORA = 0.01;  // 1% ao mês para Multa de Mora

// Tabela de IPCA por ano e mês
const ipca = {
    "2019": { "fev": 0.43, "mar": 0.75, "abr": 0.57, "mai": 0.13, "jun": 0.01, "jul": 0.19, "ago": -0.11, "set": -0.04, "out": 0.10, "nov": 0.51, "dez": 1.15 },
    "2020": { "jan": 0.21, "fev": 0.25, "mar": 0.07, "abr": -0.31, "mai": -0.38, "jun": 0.26, "jul": 0.36, "ago": 0.24, "set": 0.64, "out": 0.86, "nov": 0.89, "dez": 1.35 },
    "2021": { "jan": 0.25, "fev": 0.86, "mar": 0.93, "abr": 0.31, "mai": 0.83, "jun": 0.53, "jul": 0.96, "ago": 0.87, "set": 1.16, "out": 1.25, "nov": 0.95, "dez": 0.73 },
    "2022": { "jan": 0.54, "fev": 1.01, "mar": 1.62, "abr": 1.06, "mai": 0.47, "jun": 0.67, "jul": -0.68, "ago": -0.36, "set": -0.29, "out": 0.59, "nov": 0.41, "dez": 0.62 },
    "2023": { "jan": 0.53, "fev": 0.84, "mar": 0.71, "abr": 0.61, "mai": 0.47, "jun": -0.08, "jul": 0.12, "ago": -0.02, "set": 0.26 },
    "2024": { "jan": 0.42, "fev": 0.83, "mar": 0.16, "abr": 0.38, "mai": 0.46, "jun": 0.21, "jul": 0.38, "ago": -0.02, "set": 0.44 }
};

// Função para calcular a diferença atualizada
function applyIPCA(diferenca, periodoApuracao) {
    const [mesInicial, anoInicial] = periodoApuracao.split('/');
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

    let acumulador = diferenca;

    // Pega a data atual
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth(); // Janeiro é 0, Dezembro é 11

    let ano = parseInt(anoInicial);
    let mes = parseInt(mesInicial);

    // Percorre todos os meses desde o mês subsequente até o mês atual
    while (ano < anoAtual || (ano === anoAtual && mes <= mesAtual)) {
        const mesNome = meses[mes - 1]; // Obtem o nome do mês correspondente
        const ipcaValor = ipca[ano]?.[mesNome] || 0;  // Busca o valor do IPCA para o mês/ano

        // Aplica o IPCA acumuladamente
        acumulador *= (1 + ipcaValor / 100);

        // Avança para o próximo mês
        mes++;
        if (mes > 12) {  // Se o mês ultrapassa dezembro, volta para janeiro e avança o ano
            mes = 1;
            ano++;
        }
    }

    return acumulador;  // Retorna o valor atualizado
}

// Função para calcular os juros de mora
function calcularJurosMora(diferencaAtualizada, periodoApuracao) {
    const [mesInicial, anoInicial] = periodoApuracao.split('/');
    const dataInicial = new Date(parseInt(anoInicial), parseInt(mesInicial) - 1);  // Convertendo para Date
    const dataAtual = new Date();  // Data atual

    // Calculando a quantidade de dias de atraso
    const diasAtraso = Math.floor((dataAtual - dataInicial) / (1000 * 60 * 60 * 24));  // Diferença em dias

    // Cálculo dos Juros de Mora
    let jurosMora = diferencaAtualizada * TAXA_JUROS_MORA_DIA * diasAtraso;

    // Aplicar o limite de 20% sobre a Diferença Atualizada
    const limiteJuros = diferencaAtualizada * LIMITE_JUROS_MORA;
    if (jurosMora > limiteJuros) {
        jurosMora = limiteJuros;
    }

    return jurosMora;
}

// Função para calcular a multa de mora
function calcularMultaMora(diferencaAtualizada, periodoApuracao) {
    const [mesInicial, anoInicial] = periodoApuracao.split('/');
    const dataInicial = new Date(parseInt(anoInicial), parseInt(mesInicial) - 1);  // Convertendo para Date
    const dataAtual = new Date();  // Data atual

    // Calculando a quantidade de meses de atraso
    const mesesAtraso = (dataAtual.getFullYear() - dataInicial.getFullYear()) * 12 + (dataAtual.getMonth() - dataInicial.getMonth());

    // Cálculo da Multa de Mora
    return diferencaAtualizada * TAXA_MULTA_MORA * mesesAtraso;
}

// Função para calcular o próximo período de apuração
function getNextPeriod(period) {
    let [month, year] = period.split('/');
    month = parseInt(month);
    year = parseInt(year);

    if (month === 12) {
        month = 1;
        year += 1;
    } else {
        month += 1;
    }

    return `${month.toString().padStart(2, '0')}/${year}`;
}

// Função para atualizar os totais
function updateTotalizers() {
    const table = document.getElementById('fiscal-table');
    const rows = table.querySelectorAll('tr');

    let totalDiferencaAtualizada = 0;
    let totalMultaMora = 0;
    let totalJurosMora = 0;
    let totalDifTotalRecolher = 0;

    rows.forEach(row => {
        const diferencaAtualizada = parseFloat(row.querySelector('.diferenca-atualizada')?.value) || 0;
        const multaMora = parseFloat(row.querySelector('.multa-mora')?.value) || 0;
        const jurosMora = parseFloat(row.querySelector('.juros-mora')?.value) || 0;
        const difTotalRecolher = parseFloat(row.querySelector('.dif-total-recolher')?.value) || 0;

        totalDiferencaAtualizada += diferencaAtualizada;
        totalMultaMora += multaMora;
        totalJurosMora += jurosMora;
        totalDifTotalRecolher += difTotalRecolher;
    });

    // Atualizar os campos de totalização
    const totalRow = document.getElementById('total-row'); // Certifique-se de que este ID exista
    if (totalRow) {
        totalRow.querySelector('#total-diferenca-atualizada').value = totalDiferencaAtualizada.toFixed(2);
        totalRow.querySelector('#total-multa-mora').value = totalMultaMora.toFixed(2);
        totalRow.querySelector('#total-juros-mora').value = totalJurosMora.toFixed(2);
        totalRow.querySelector('#total-dif-total-recolher').value = totalDifTotalRecolher.toFixed(2);
    }
}

// Certifique-se de chamar a função updateTotalizers após a adição e remoção de linhas
document.getElementById('add-row').addEventListener('click', () => {
    
    updateTotalizers(); // Atualiza após adicionar uma nova linha
});

// Função para adicionar listeners de cálculo
function addCalculationListenersToRow(row) {
    const inputs = row.querySelectorAll('.base-calculo-declarada, .receita-apurada, .iss-retido, .deducoes, .aliquota, .iss-compensado');
    inputs.forEach(input => {
        input.addEventListener('input', function(e) {
            const currentRow = e.target.parentElement.parentElement;

            const receitaApurada = parseFloat(currentRow.querySelector('.receita-apurada').value) || 0;
            const issRetido = parseFloat(currentRow.querySelector('.iss-retido').value) || 0;
            const deducoes = parseFloat(currentRow.querySelector('.deducoes').value) || 0;
            const aliquota = parseFloat(currentRow.querySelector('.aliquota').value) || 0;
            const issCompensado = parseFloat(currentRow.querySelector('.iss-compensado').value) || 0;

            // Cálculo da base de cálculo
            const baseCalculo = receitaApurada - (issRetido + deducoes);
            currentRow.querySelector('.base-calculo').value = baseCalculo.toFixed(2);

            // Cálculo do valor devido
            const valorDevido = baseCalculo * (aliquota / 100);
            currentRow.querySelector('.valor-devido').value = valorDevido.toFixed(2);

            // Cálculo da diferença a recolher
            const issRecolhido = parseFloat(currentRow.querySelector('.iss-recolhido').value) || 0;
            const diferencaRecolher = valorDevido - (issCompensado + issRecolhido);
            currentRow.querySelector('.diferenca-recolher').value = diferencaRecolher.toFixed(2);

            // Aplicar IPCA no cálculo da Diferença Atualizada
            const periodoApuracao = currentRow.querySelector('td:nth-child(1) input').value; // Ex: "01/2023"
            const diferencaAtualizada = applyIPCA(diferencaRecolher, periodoApuracao);
            currentRow.querySelector('.diferenca-atualizada').value = diferencaAtualizada.toFixed(2);

            // Cálculo dos Juros de Mora
            const jurosMora = calcularJurosMora(diferencaAtualizada, periodoApuracao);
            currentRow.querySelector('.juros-mora').value = jurosMora.toFixed(2);

            // Cálculo da Multa de Mora
            const multaMora = calcularMultaMora(diferencaAtualizada, periodoApuracao);
            currentRow.querySelector('.multa-mora').value = multaMora.toFixed(2);

            // Cálculo da Dif. Total a Recolher
            const totalARecolher = diferencaAtualizada + multaMora + jurosMora;
            currentRow.querySelector('.dif-total-recolher').value = totalARecolher.toFixed(2);

            // Após atualizar os valores da linha, atualize os totais
            updateTotalizers();
        });

        input.addEventListener('blur', function(e) {
            const value = parseFloat(e.target.value) || 0;
            e.target.value = value.toFixed(2);
        });
    });
}

// Função para adicionar nova linha para o mesmo período sem gerar valores aleatórios
function addSamePeriodFunctionalityToRow(row) {
    const samePeriodButton = row.querySelector('.same-period-row');

    if (samePeriodButton) {
        samePeriodButton.addEventListener('click', function(e) {
            const currentRow = e.target.parentElement.parentElement;
            const newRow = document.createElement('tr');

            const period = currentRow.querySelector('td:nth-child(1) input').value;  // Mantém o mesmo período de apuração

            newRow.innerHTML = `
                <td><input type="text" value="${period}" disabled></td>
                <td><input type="text" disabled></td>
                <td><input type="number" class="base-calculo-declarada" disabled></td>
                <td>
                    <select class="ctiss-apurado">
                        <option value=""></option>
                        <option value="0702-0/01">0702-0/01</option>
                        <option value="0702-0/02">0702-0/02</option>
                        <option value="0702-0/03">0702-0/03</option>
                        <option value="0702-0/04">0702-0/04</option>
                    </select>
                </td>
                <td><input type="number" class="receita-apurada" step="0.01" value="0.00"></td>
                <td><input type="number" class="iss-retido" step="0.01" value="0.00"></td>
                <td><input type="number" class="deducoes" step="0.01" value="0.00"></td>
                <td><input type="number" class="base-calculo" disabled></td>
                <td><input type="number" class="aliquota" min="2" max="5" step="0.01" value="5.00"></td>
                <td><input type="number" class="valor-devido" disabled></td>
                <td><input type="number" class="iss-compensado" step="0.01" value="0.00"></td>
                <td><input type="number" class="iss-recolhido" disabled></td>
                <td><input type="number" class="diferenca-recolher" disabled></td>
                <td><button class="remove-row" style="background-color: red; color: white;">-</button></td>
                <td><input type="number" class="diferenca-atualizada" disabled value="0.00"></td> <!-- Nova célula para Diferença Atualizada -->
                <td><input type="number" class="juros-mora" disabled value="0.00"></td> <!-- Nova célula para Juros de Mora -->
                <td><input type="number" class="multa-mora" disabled value="0.00"></td> <!-- Nova célula para Multa de Mora -->
                <td><input type="number" class="dif-total-recolher" disabled value="0.00"></td> <!-- Nova célula para Dif. Total a Recolher -->
            `;

            currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);

            // Adiciona eventos de cálculo e remoção para a nova linha
            addCalculationListenersToRow(newRow);
            addSamePeriodFunctionalityToRow(newRow);
            addRemoveRowFunctionalityToRow(newRow);
        });
    }
}

// Função para remover uma linha ao clicar no botão "-"
function addRemoveRowFunctionalityToRow(row) {
    const removeButton = row.querySelector('.remove-row');
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            const rowToRemove = e.target.parentElement.parentElement;
            rowToRemove.remove(); // Remove a linha atual

            // Atualiza os totais após a remoção
            updateTotalizers();
        });
    }
}

// Função para adicionar nova linha
function addNewPeriodRow() {
    const table = document.getElementById('fiscal-table');
    const row = document.createElement('tr');

    // Função para calcular o próximo período de apuração
    currentPeriod = getNextPeriod(currentPeriod);

    // Gerar valores aleatórios para o contribuinte
    const itemCTISS = generateCTISS();
    const baseCalculoDeclarada = generateBaseCalculo();
    const issRecolhido = (parseFloat(baseCalculoDeclarada) * 0.05).toFixed(2);  // 5% da Base de Cálculo Declarada

    row.innerHTML = `
        <td><input type="text" value="${currentPeriod}" disabled></td>
        <td><input type="text" value="${itemCTISS}" disabled></td>
        <td><input type="number" class="base-calculo-declarada" value="${parseFloat(baseCalculoDeclarada).toFixed(2)}" disabled></td>
        <td>
            <select class="ctiss-apurado">
                <option value=""></option>
                <option value="0702-0/01">0702-0/01</option>
                <option value="0702-0/02">0702-0/02</option>
                <option value="0702-0/03">0702-0/03</option>
                <option value="0702-0/04">0702-0/04</option>
            </select>
        </td>
        <td><input type="number" class="receita-apurada" step="0.01" value="0.00"></td>
        <td><input type="number" class="iss-retido" step="0.01" value="0.00"></td>
        <td><input type="number" class="deducoes" step="0.01" value="0.00"></td>
        <td><input type="number" class="base-calculo" disabled></td>
        <td><input type="number" class="aliquota" min="2" max="5" step="0.01" value="5.00"></td>
        <td><input type="number" class="valor-devido" disabled></td>
        <td><input type="number" class="iss-compensado" step="0.01" value="0.00"></td>
        <td><input type="number" class="iss-recolhido" value="${parseFloat(issRecolhido).toFixed(2)}" disabled></td>
        <td><input type="number" class="diferenca-recolher" disabled></td>
        <td><button class="same-period-row">+</button></td>
        <td><input type="number" class="diferenca-atualizada" disabled value="0.00"></td> <!-- Nova célula para Diferença Atualizada -->
        <td><input type="number" class="juros-mora" disabled value="0.00"></td> <!-- Nova célula para Juros de Mora -->
        <td><input type="number" class="multa-mora" disabled value="0.00"></td> <!-- Nova célula para Multa de Mora -->
        <td><input type="number" class="dif-total-recolher" disabled value="0.00"></td> <!-- Nova célula para Dif. Total a Recolher -->
    `;

    table.appendChild(row);

    // Adiciona os eventos de cálculo e remoção para a nova linha
    addCalculationListenersToRow(row);
    addSamePeriodFunctionalityToRow(row);
    addRemoveRowFunctionalityToRow(row);
}

// Funções para gerar valores aleatórios (somente no botão "Adicionar Linha")
function generateCTISS() {
    const codes = ['0702-0/01', '0702-0/02', '0702-0/03', '0702-0/04'];
    return codes[Math.floor(Math.random() * codes.length)];
}

function generateBaseCalculo() {
    return (Math.random() * 1000).toFixed(2);
}

// Inicializa o botão de adicionar linha
document.getElementById('add-row').addEventListener('click', addNewPeriodRow);

