async function fetchAPI() {
  const response = await fetch('http://localhost:3000/api/freight-report');
  return await response.json();
}

async function testAPI() {
  console.log('🚀 开始测试API性能...\n');
  
  // 测试1：首次请求
  console.log('📊 测试1：首次请求（应该计算）');
  const start1 = Date.now();
  try {
    const res1 = await fetchAPI();
    const time1 = Date.now() - start1;
    console.log(`✅ 响应时间: ${time1}ms`);
    console.log(`📦 数据大小: ${JSON.stringify(res1).length} 字节`);
    console.log(`🔄 使用缓存: ${res1.cached ? '是' : '否'}`);
    console.log(`📈 数据条数: ${res1.data.dailyReports.length}\n`);
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    return;
  }
  
  // 等待1秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试2：缓存请求
  console.log('📊 测试2：缓存请求（应该使用缓存）');
  const start2 = Date.now();
  try {
    const res2 = await fetchAPI();
    const time2 = Date.now() - start2;
    console.log(`✅ 响应时间: ${time2}ms`);
    console.log(`🔄 使用缓存: ${res2.cached ? '是' : '否'}`);
    
    if (res2.cached) {
      console.log(`🎉 缓存命中！性能提升: ${Math.round(((time1 - time2) / time1) * 100)}%\n`);
    } else {
      console.log(`⚠️  缓存未命中\n`);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
  
  // 测试3：连续请求10次
  console.log('📊 测试3：连续请求10次（测试缓存稳定性）');
  const times = [];
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    try {
      const res = await fetchAPI();
      const time = Date.now() - start;
      times.push(time);
      console.log(`  请求 ${i + 1}: ${time}ms ${res.cached ? '(缓存)' : '(计算)'}`);
    } catch (error) {
      console.error(`  请求 ${i + 1}: 失败`);
    }
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`\n📈 统计结果:`);
  console.log(`  平均响应时间: ${avgTime.toFixed(2)}ms`);
  console.log(`  最快响应时间: ${minTime}ms`);
  console.log(`  最慢响应时间: ${maxTime}ms`);
}

testAPI();

