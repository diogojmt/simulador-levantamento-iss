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

// Função para inicializar os campos com o Flatpickr e o plugin de seleção de mês
function initializeDatePickers() {
    flatpickr("#periodo-apuracao-inicial", {
        plugins: [
            new monthSelectPlugin({
                shorthand: true,          // Exibe abreviações de mês (ex: "Jan", "Feb")
                dateFormat: "m/Y",        // Formato de exibição (ex: "01/2023")
                altFormat: "F Y"          // Formato alternativo para leitura (ex: "Janeiro 2023")
            })
        ],
        allowInput: true  // Permite que o usuário digite manualmente, se desejar
    });

    flatpickr("#periodo-apuracao-final", {
        plugins: [
            new monthSelectPlugin({
                shorthand: true,
                dateFormat: "m/Y",
                altFormat: "F Y"
            })
        ],
        allowInput: true
    });
}

// Chame a função para inicializar os campos ao carregar a página
document.addEventListener("DOMContentLoaded", initializeDatePickers);

// Função para gerar períodos de apuração com base em um intervalo de datas
function generatePeriods(start, end) {
    const periods = [];
    let [startMonth, startYear] = start.split('/').map(Number);
    let [endMonth, endYear] = end.split('/').map(Number);

    // Adiciona cada mês ao array até alcançar o mês final
    while (startYear < endYear || (startYear === endYear && startMonth <= endMonth)) {
        const period = `${String(startMonth).padStart(2, '0')}/${startYear}`;
        periods.push(period);
        
        // Avança para o próximo mês
        startMonth++;
        if (startMonth > 12) {
            startMonth = 1;
            startYear++;
        }
    }

    return periods;
}


// Função para adicionar uma linha com um período específico
function addRowWithPeriod(period) {
    const table = document.getElementById('fiscal-table');
    const row = document.createElement('tr');

    // Gera valores aleatórios para outras colunas ou mantenha o campo vazio para o usuário preencher
    const itemCTISS = generateCTISS();
    const baseCalculoDeclarada = generateBaseCalculo();
    const issRecolhido = (parseFloat(baseCalculoDeclarada) * 0.05).toFixed(2);

    // Criação da linha com o campo "Período de Apuração" incluindo name="periodo-apuracao"
    row.innerHTML = `
        <td><input type="text" name="periodo-apuracao" value="${period}" disabled></td>
        <td><input type="text" value="${itemCTISS}" disabled></td>
        <td><input type="number" class="base-calculo-declarada" value="${baseCalculoDeclarada}" step="0.01" disabled></td>
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
        <td><input type="number" class="iss-recolhido" value="${issRecolhido}" disabled></td>
        <td><input type="number" class="diferenca-recolher" disabled></td>
        <td><button class="same-period-row">+</button></td>
        <td><input type="number" class="diferenca-atualizada" disabled value="0.00"></td>
        <td><input type="number" class="juros-mora" disabled value="0.00"></td>
        <td><input type="number" class="multa-mora" disabled value="0.00"></td>
        <td><input type="number" class="dif-total-recolher" disabled value="0.00"></td>
    `;

    table.appendChild(row);

    // Adiciona os eventos de cálculo e replicação à nova linha
    addCalculationListenersToRow(row);
    addSamePeriodFunctionalityToRow(row);
    addRemoveRowFunctionalityToRow(row);

    // Atualiza os totalizadores para garantir que todos os valores estão corretos após a nova linha
    updateTotalizers();

    // Debug: Verifique se o campo está corretamente configurado
    const periodoApuracaoInput = row.querySelector('input[name="periodo-apuracao"]');
    if (!periodoApuracaoInput) {
        console.error("Campo 'Período de Apuração' não encontrado na linha recém-criada.");
    } else {
        console.log("Campo 'Período de Apuração' encontrado:", periodoApuracaoInput.value);
    }
}

// Verificação no evento de input para evitar erros em campos nulos
function addCalculationListenersToRow(row) {
    const inputs = row.querySelectorAll('.base-calculo-declarada, .receita-apurada, .iss-retido, .deducoes, .aliquota, .iss-compensado');
    
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            const currentRow = input.closest('tr');
            
            // Acessa os campos somente se eles existirem na linha
            const receitaApurada = currentRow.querySelector('.receita-apurada') ? parseFloat(currentRow.querySelector('.receita-apurada').value) || 0 : 0;
            const issRetido = currentRow.querySelector('.iss-retido') ? parseFloat(currentRow.querySelector('.iss-retido').value) || 0 : 0;
            const deducoes = currentRow.querySelector('.deducoes') ? parseFloat(currentRow.querySelector('.deducoes').value) || 0 : 0;
            const aliquota = currentRow.querySelector('.aliquota') ? parseFloat(currentRow.querySelector('.aliquota').value) || 0 : 0;
            const issCompensado = currentRow.querySelector('.iss-compensado') ? parseFloat(currentRow.querySelector('.iss-compensado').value) || 0 : 0;

            const baseCalculo = receitaApurada - (issRetido + deducoes);
            const baseCalculoEl = currentRow.querySelector('.base-calculo');
            if (baseCalculoEl) baseCalculoEl.value = baseCalculo.toFixed(2);

            const valorDevido = baseCalculo * (aliquota / 100);
            const valorDevidoEl = currentRow.querySelector('.valor-devido');
            if (valorDevidoEl) valorDevidoEl.value = valorDevido.toFixed(2);

            const issRecolhidoEl = currentRow.querySelector('.iss-recolhido');
            const issRecolhido = issRecolhidoEl ? parseFloat(issRecolhidoEl.value) || 0 : 0;
            const diferencaRecolher = valorDevido - (issCompensado + issRecolhido);
            const diferencaRecolherEl = currentRow.querySelector('.diferenca-recolher');
            if (diferencaRecolherEl) diferencaRecolherEl.value = diferencaRecolher.toFixed(2);

            const periodoApuracaoEl = currentRow.querySelector('td:nth-child(1) input');
            const periodoApuracao = periodoApuracaoEl ? periodoApuracaoEl.value : '';
            const diferencaAtualizada = applyIPCA(diferencaRecolher, periodoApuracao);
            const diferencaAtualizadaEl = currentRow.querySelector('.diferenca-atualizada');
            if (diferencaAtualizadaEl) diferencaAtualizadaEl.value = diferencaAtualizada.toFixed(2);

            const jurosMora = calcularJurosMora(diferencaAtualizada, periodoApuracao);
            const jurosMoraEl = currentRow.querySelector('.juros-mora');
            if (jurosMoraEl) jurosMoraEl.value = jurosMora.toFixed(2);

            const multaMora = calcularMultaMora(diferencaAtualizada, periodoApuracao);
            const multaMoraEl = currentRow.querySelector('.multa-mora');
            if (multaMoraEl) multaMoraEl.value = multaMora.toFixed(2);

            const difTotalRecolher = diferencaAtualizada + multaMora + jurosMora;
            const difTotalRecolherEl = currentRow.querySelector('.dif-total-recolher');
            if (difTotalRecolherEl) difTotalRecolherEl.value = difTotalRecolher.toFixed(2);

            // Atualiza os totalizadores após cada alteração
            updateTotalizers();
        });
    });
}


// Função para iniciar a simulação com o intervalo de períodos, verificando os inputs
function iniciarSimulacao() {
    const startPeriod = document.getElementById('periodo-apuracao-inicial').value;
    const endPeriod = document.getElementById('periodo-apuracao-final').value;

    // Validação simples para checar se o período final é menor que o inicial
    if (new Date(`01/${startPeriod}`) > new Date(`01/${endPeriod}`)) {
        alert("Período Final não pode ser menor que o Período Inicial.");
        return;
    }

    // Gera os períodos no intervalo e adiciona uma linha para cada período
    let currentPeriod = startPeriod;
    while (currentPeriod <= endPeriod) {
        addRowWithPeriod(currentPeriod);
        currentPeriod = getNextPeriod(currentPeriod);
    }
}

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
    month = parseInt(month, 10);
    year = parseInt(year, 10);

    if (month === 12) {
        month = 1;
        year += 1;
    } else {
        month += 1;
    }

    return `${String(month).padStart(2, '0')}/${year}`;
}

// Ajuste nos cálculos para checar se os elementos existem antes de acessar seus valores
function updateTotalizers() {
    const table = document.getElementById('fiscal-table');
    const rows = table.querySelectorAll('tr');

    let totalDiferencaAtualizada = 0;
    let totalMultaMora = 0;
    let totalJurosMora = 0;
    let totalDifTotalRecolher = 0;

    rows.forEach(row => {
        // Usa valor 0 caso o elemento seja null ou undefined
        const diferencaAtualizada = row.querySelector('.diferenca-atualizada')?.value ? parseFloat(row.querySelector('.diferenca-atualizada').value) : 0;
        const multaMora = row.querySelector('.multa-mora')?.value ? parseFloat(row.querySelector('.multa-mora').value) : 0;
        const jurosMora = row.querySelector('.juros-mora')?.value ? parseFloat(row.querySelector('.juros-mora').value) : 0;
        const difTotalRecolher = row.querySelector('.dif-total-recolher')?.value ? parseFloat(row.querySelector('.dif-total-recolher').value) : 0;

        totalDiferencaAtualizada += diferencaAtualizada;
        totalMultaMora += multaMora;
        totalJurosMora += jurosMora;
        totalDifTotalRecolher += difTotalRecolher;
    });

    // Atualizar os campos de totalização
    const totalRow = document.getElementById('total-row');
    if (totalRow) {
        totalRow.querySelector('#total-diferenca-atualizada').value = totalDiferencaAtualizada.toFixed(2);
        totalRow.querySelector('#total-multa-mora').value = totalMultaMora.toFixed(2);
        totalRow.querySelector('#total-juros-mora').value = totalJurosMora.toFixed(2);
        totalRow.querySelector('#total-dif-total-recolher').value = totalDifTotalRecolher.toFixed(2);
    }
}

// Função para replicar valores para células abaixo e recalcular os valores
function replicateValue(button) {
    // Obtém o campo ao lado do botão e o valor a ser replicado
    const inputField = button.previousElementSibling;
    const valueToReplicate = inputField.value;
    const currentRow = button.closest("tr");
    const cellIndex = [...currentRow.cells].indexOf(inputField.closest("td"));
    let nextRow = currentRow.nextElementSibling;

    // Replicação para as próximas linhas
    while (nextRow) {
        const targetCell = nextRow.cells[cellIndex];
        const nextInput = targetCell ? targetCell.querySelector("input") : null;
        if (nextInput && nextInput.type === inputField.type) {
            nextInput.value = valueToReplicate;
            
            // Aciona o evento de 'input' manualmente para recalcular os valores da linha
            nextInput.dispatchEvent(new Event('input'));
        }
        nextRow = nextRow.nextElementSibling;
    }
}

// Função para adicionar botões de replicação e listeners de cálculo
function addCalculationListenersToRow(row) {
    const inputs = row.querySelectorAll('.receita-apurada, .iss-retido, .deducoes, .aliquota, .iss-compensado');

    inputs.forEach(input => {
        // Verifica se o campo não é "Base de Cálculo Declarada" antes de adicionar o botão
        if (!input.classList.contains('base-calculo-declarada')) {
            // Cria o wrapper para o campo de entrada e o botão de replicação
            const wrapper = document.createElement("div");
            wrapper.classList.add("input-wrapper");

            // Move o campo de entrada para dentro do wrapper
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            // Cria o botão de replicação e adiciona ao wrapper
            const replicateBtn = document.createElement("button");
            replicateBtn.innerHTML = '<i class="fas fa-clone"></i>'; // Ícone de replicação
            replicateBtn.classList.add("replicate-btn");
            replicateBtn.title = "Replicar valor para linhas abaixo";
            replicateBtn.type = "button";
            replicateBtn.onclick = () => replicateValue(replicateBtn);

            // Adiciona o botão de replicação ao lado do campo de entrada
            wrapper.appendChild(replicateBtn);
        }

        // Configura os cálculos automáticos ao inserir valores
        input.addEventListener('input', function(e) {
            const currentRow = e.target.closest("tr");  // Corrige a seleção da linha
            const receitaApurada = parseFloat(currentRow.querySelector('.receita-apurada')?.value) || 0;
            const issRetido = parseFloat(currentRow.querySelector('.iss-retido')?.value) || 0;
            const deducoes = parseFloat(currentRow.querySelector('.deducoes')?.value) || 0;
            const aliquota = parseFloat(currentRow.querySelector('.aliquota')?.value) || 0;
            const issCompensado = parseFloat(currentRow.querySelector('.iss-compensado')?.value) || 0;

            // Cálculo da base de cálculo
            const baseCalculo = receitaApurada - (issRetido + deducoes);
            currentRow.querySelector('.base-calculo').value = baseCalculo.toFixed(2);

            // Cálculo do valor devido
            const valorDevido = baseCalculo * (aliquota / 100);
            currentRow.querySelector('.valor-devido').value = valorDevido.toFixed(2);

            // Cálculo da diferença a recolher
            const issRecolhido = parseFloat(currentRow.querySelector('.iss-recolhido')?.value) || 0;
            const diferencaRecolher = valorDevido - (issCompensado + issRecolhido);
            currentRow.querySelector('.diferenca-recolher').value = diferencaRecolher.toFixed(2);
			
			// Calcula a diferença atualizada, juros de mora e multa de mora
            const periodoApuracao = currentRow.querySelector('input[name="periodo-apuracao"]').value;
            const diferencaAtualizada = applyIPCA(diferencaRecolher, periodoApuracao);
            currentRow.querySelector('.diferenca-atualizada').value = diferencaAtualizada.toFixed(2);

            const jurosMora = calcularJurosMora(diferencaAtualizada, periodoApuracao);
            currentRow.querySelector('.juros-mora').value = jurosMora.toFixed(2);

            const multaMora = calcularMultaMora(diferencaAtualizada, periodoApuracao);
            currentRow.querySelector('.multa-mora').value = multaMora.toFixed(2);

            // Calcula o total a recolher
            const totalARecolher = diferencaAtualizada + multaMora + jurosMora;
            currentRow.querySelector('.dif-total-recolher').value = totalARecolher.toFixed(2);

            updateTotalizers();
        });

        // Formata o valor para duas casas decimais ao sair do campo
        input.addEventListener('blur', function(e) {
            const value = parseFloat(e.target.value) || 0;
            e.target.value = value.toFixed(2);
        });
    });
}

// Certifique-se de chamar a função updateTotalizers após a adição e remoção de linhas
document.getElementById('add-row').addEventListener('click', () => {
    
    updateTotalizers(); // Atualiza após adicionar uma nova linha
});

// Função para adicionar nova linha com nomes de campo únicos
function addNewPeriodRow() {
    const table = document.getElementById('fiscal-table');
    const row = document.createElement('tr');
    currentPeriod = getNextPeriod(currentPeriod);

    // Gerar valores aleatórios para o contribuinte
    const itemCTISS = generateCTISS();
    const baseCalculoDeclarada = generateBaseCalculo();
    const issRecolhido = (parseFloat(baseCalculoDeclarada) * 0.05).toFixed(2);  // Exemplo: 5% da Base de Cálculo Declarada

    row.innerHTML = `
        <td><input type="text" name="periodo-apuracao" value="${currentPeriod}" disabled></td>
        <td><input type="text" name="item-ctiss" value="${itemCTISS}" disabled></td>
        <td><input type="number" name="base-calculo-declarada" class="base-calculo-declarada" step="0.01" value="${baseCalculoDeclarada}" disabled></td>
        <td>
            <select name="ctiss-apurado" class="ctiss-apurado">
                <option value=""></option>
                <option value="0702-0/01">0702-0/01</option>
                <option value="0702-0/02">0702-0/02</option>
                <option value="0702-0/03">0702-0/03</option>
                <option value="0702-0/04">0702-0/04</option>
            </select>
        </td>
        <td><input type="number" name="receita-apurada" class="receita-apurada" step="0.01" value="0.00"></td>
        <td><input type="number" name="iss-retido" class="iss-retido" step="0.01" value="0.00"></td>
        <td><input type="number" name="deducoes" class="deducoes" step="0.01" value="0.00"></td>
        <td><input type="number" name="base-calculo" class="base-calculo" disabled></td>
        <td><input type="number" name="aliquota" class="aliquota" min="2" max="5" step="0.01" value="5.00"></td>
        <td><input type="number" name="valor-devido" class="valor-devido" disabled></td>
        <td><input type="number" name="iss-compensado" class="iss-compensado" step="0.01" value="0.00"></td>
        <td><input type="number" name="iss-recolhido" class="iss-recolhido" step="0.01" value="${issRecolhido}" disabled></td>
        <td><input type="number" name="diferenca-recolher" class="diferenca-recolher" disabled></td>
        <td><button class="same-period-row">+</button></td>
        <td><input type="number" name="diferenca-atualizada" class="diferenca-atualizada" disabled value="0.00"></td>
        <td><input type="number" name="juros-mora" class="juros-mora" disabled value="0.00"></td>
        <td><input type="number" name="multa-mora" class="multa-mora" disabled value="0.00"></td>
        <td><input type="number" name="dif-total-recolher" class="dif-total-recolher" disabled value="0.00"></td>
    `;

    table.appendChild(row);

    // Adiciona os eventos de cálculo, replicação, e remoção para a nova linha
    addCalculationListenersToRow(row);
    addSamePeriodFunctionalityToRow(row);
    addRemoveRowFunctionalityToRow(row);

    // Atualiza os totais após adicionar a nova linha
    updateTotalizers();
}

// Função para adicionar nova linha para o mesmo período e calcular valores automaticamente
function addSamePeriodFunctionalityToRow(row) {
    const samePeriodButton = row.querySelector('.same-period-row');

    if (samePeriodButton) {
        samePeriodButton.addEventListener('click', function(e) {
            const currentRow = e.target.parentElement.parentElement;
            const newRow = document.createElement('tr');

            const period = currentRow.querySelector('input[name="periodo-apuracao"]').value;  // Mantém o mesmo período de apuração

            newRow.innerHTML = `
                <td><input type="text" name="periodo-apuracao" value="${period}" disabled></td>
                <td><input type="text" name="item-ctiss" disabled></td>
                <td><input type="number" class="base-calculo-declarada" step="0.01" disabled></td>
                <td>
                    <select class="ctiss-apurado">
                        <option value=""></option>
                        <option value="0702-0/01">0702-0/01</option>
                        <option value="0702-0/02">0702-0/02</option>
                        <option value="0702-0/03">0702-0/03</option>
                        <option value="0702-0/04">0702-0/04</option>
                    </select>
                </td>
                <td><input type="number" class="receita-apurada" step="0.01"></td>
                <td><input type="number" class="iss-retido" step="0.01"></td>
                <td><input type="number" class="deducoes" step="0.01"></td>
                <td><input type="number" class="base-calculo" disabled></td>
                <td><input type="number" class="aliquota" min="2" max="5" step="0.01" value="5.00"></td>
                <td><input type="number" class="valor-devido" disabled></td>
                <td><input type="number" class="iss-compensado" step="0.01"></td>
                <td><input type="number" class="iss-recolhido" step="0.01" value="0.00" disabled></td>
                <td><input type="number" class="diferenca-recolher" disabled></td>
                <td><button class="remove-row" style="background-color: red; color: white;">-</button></td>
                <td><input type="number" class="diferenca-atualizada" disabled value="0.00"></td>
                <td><input type="number" class="juros-mora" disabled value="0.00"></td>
                <td><input type="number" class="multa-mora" disabled value="0.00"></td>
                <td><input type="number" class="dif-total-recolher" disabled value="0.00"></td>
            `;

            currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);

            // Adiciona eventos de cálculo e remoção para a nova linha
            addCalculationListenersToRow(newRow);
            addRemoveRowFunctionalityToRow(newRow);
            addSamePeriodFunctionalityToRow(newRow);

            // Recalcula os valores na nova linha para garantir a atualização
            recalculateRowValues(newRow);

            // Atualiza os totalizadores após adicionar uma nova linha
            updateTotalizers();
        });
    }
}

// Função para recalcular todos os valores de uma linha (usado ao adicionar linhas dinâmicas)
function recalculateRowValues(row) {
    // Verificações para cada campo necessário
    const receitaApuradaInput = row.querySelector('.receita-apurada');
    const issRetidoInput = row.querySelector('.iss-retido');
    const deducoesInput = row.querySelector('.deducoes');
    const aliquotaInput = row.querySelector('.aliquota');
    const issCompensadoInput = row.querySelector('.iss-compensado');
    const baseCalculoField = row.querySelector('.base-calculo');
    const valorDevidoField = row.querySelector('.valor-devido');
    const issRecolhidoInput = row.querySelector('.iss-recolhido');
    const diferencaRecolherField = row.querySelector('.diferenca-recolher');
    const diferencaAtualizadaField = row.querySelector('.diferenca-atualizada');
    const jurosMoraField = row.querySelector('.juros-mora');
    const multaMoraField = row.querySelector('.multa-mora');
    const difTotalRecolherField = row.querySelector('.dif-total-recolher');
    const periodoApuracaoInput = row.querySelector('input[name="periodo-apuracao"]');

    // Garantir que os campos não sejam nulos antes de acessar os valores
    if (!receitaApuradaInput || !issRetidoInput || !deducoesInput || !aliquotaInput || !issCompensadoInput || !baseCalculoField || !valorDevidoField || !issRecolhidoInput || !diferencaRecolherField || !diferencaAtualizadaField || !jurosMoraField || !multaMoraField || !difTotalRecolherField || !periodoApuracaoInput) {
        console.error("Um ou mais campos estão ausentes na linha:", row);
        return;
    }

    // Obter valores com verificações de nulos e conversões de tipo
    const receitaApurada = parseFloat(receitaApuradaInput.value) || 0;
    const issRetido = parseFloat(issRetidoInput.value) || 0;
    const deducoes = parseFloat(deducoesInput.value) || 0;
    const aliquota = parseFloat(aliquotaInput.value) || 0;
    const issCompensado = parseFloat(issCompensadoInput.value) || 0;

    const baseCalculo = receitaApurada - (issRetido + deducoes);
    baseCalculoField.value = baseCalculo.toFixed(2);

    const valorDevido = baseCalculo * (aliquota / 100);
    valorDevidoField.value = valorDevido.toFixed(2);

    const issRecolhido = parseFloat(issRecolhidoInput.value) || 0;
    const diferencaRecolher = valorDevido - (issCompensado + issRecolhido);
    diferencaRecolherField.value = diferencaRecolher.toFixed(2);

    const periodoApuracao = periodoApuracaoInput.value;
    const diferencaAtualizada = applyIPCA(diferencaRecolher, periodoApuracao);
    diferencaAtualizadaField.value = diferencaAtualizada.toFixed(2);

    const jurosMora = calcularJurosMora(diferencaAtualizada, periodoApuracao);
    jurosMoraField.value = jurosMora.toFixed(2);

    const multaMora = calcularMultaMora(diferencaAtualizada, periodoApuracao);
    multaMoraField.value = multaMora.toFixed(2);

    const totalARecolher = diferencaAtualizada + multaMora + jurosMora;
    difTotalRecolherField.value = totalARecolher.toFixed(2);
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


// Funções para gerar valores aleatórios (somente no botão "Adicionar Linha")
function generateCTISS() {
    const codes = ['0702-0/01', '0702-0/02', '0702-0/03', '0702-0/04'];
    return codes[Math.floor(Math.random() * codes.length)];
}

// Função para gerar valores aleatórios entre 1000 e 10000
function generateBaseCalculo() {
    return (Math.random() * 1000).toFixed(2);  // Gera um número entre 1000 e 10000
}

// Inicializa o botão de adicionar linha
document.getElementById('add-row').addEventListener('click', addNewPeriodRow);

// Associando o botão "Iniciar Simulação" à função iniciarSimulacao
document.getElementById('iniciar-simulacao').addEventListener('click', iniciarSimulacao);