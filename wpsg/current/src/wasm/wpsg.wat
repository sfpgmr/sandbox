   (module (type $oscillatorFunc (func (param i32) (result f32))) (import "env" "memory" (memory $memory 1 10 shared)) (export "setRate" (func $set_rate)) (export "initEnvelope" (func $initEnvelope)) (export "initEnvelopeWork" (func $initEnvelopeWork)) (export "keyOnEnvelope" (func $keyOnEnvelope)) (export "keyOffEnvelope" (func $keyOffEnvelope)) (export "doEnvelope" (func $doEnvelope)) (export "initMemory" (func $initMemory)) (export "allocateMemory" (func $allocateMemory)) (export "freeMemory" (func $freeMemory)) (export "initWaveTable" (func $initWaveTable)) (export "allocateWaveTable" (func $allocateWaveTable)) (export "initWaveTableWork" (func $initWaveTableWork)) (export "readWaveTable" (func $readWaveTable)) (table 2 funcref) (elem (i32.const 0) $readWaveTable)                        (func $initMemory (i32.store (i32.const 0) (i32.const 9072) ) )  (func $allocateMemory (param $size i32) (result i32) (local $mem_offset i32) (local $mem_page i32)  (local.set $size (i32.and (i32.add (local.get $size) (i32.const 0x7) ) (i32.const 0xffff_fff8) ) ) (if (i32.gt_u (local.tee $mem_page (i32.shr_u (local.tee $mem_offset (i32.add (local.get $size) (i32.const 0)) ) (i32.const 16) ) ) (memory.size) ) (then  (drop (memory.grow (i32.sub (local.get $mem_page) (i32.const 1) ) ) ) ) ) (i32.store (i32.const 0) (local.get $mem_offset) ) (local.get $mem_offset) )  (func $freeMemory (param $offset i32) (i32.store (i32.const 0) (local.get $offset) ) )  (func $set_rate (param $r f32) (f32.store (i32.const 4) (local.get $r) ) (f32.store (i32.const 8) (f32.div (f32.const 1) (local.get $r) ) ) )   (func $initWaveTable  (param $wave_table_offset i32)  (param $size i32) (i32.store (i32.const 0) (i32.const 0) ) (i32.store (i32.add (i32.const 8) (local.get $wave_table_offset) ) (local.get $size) ) (i32.store (i32.add (i32.const 12) (local.get $wave_table_offset) ) (i32.sub (local.get $size) (i32.const 1) ) )  (i32.store (i32.add (i32.const 4) (local.get $wave_table_offset) ) (i32.const 0) ) )  (func $allocateWaveTable (param $data_size i32) (result i32) (local $offset i32) (call $initWaveTable (local.tee $offset (call $allocateMemory (i32.add (local.get $data_size) (i32.const 16) ) ) ) (local.get $data_size) ) (local.get $offset) )  (func $initWaveTableWork (param $wave_table_work_offset i32) (param $wave_table_offset i32) (param $base_frequency f32) (f32.store (i32.add (i32.const 8) (local.get $wave_table_work_offset) ) (f32.load (i32.const 4)) ) (f32.store (i32.add (i32.const 20) (local.get $wave_table_work_offset) ) (local.get $base_frequency) ) (f32.store (i32.add (i32.const 24) (local.get $wave_table_work_offset) ) (f32.mul (local.get $base_frequency) (f32.convert_i32_s (i32.load (i32.add (i32.const 8) (local.get $wave_table_offset) ) ) ) ) ) (i32.store (i32.add (i32.const 28) (local.get $wave_table_work_offset) ) (i32.const 0) )  (f32.store (i32.add (i32.const 4) (local.get $wave_table_work_offset) ) (f32.const 1) )  (f32.store (i32.add (i32.const 32) (local.get $wave_table_work_offset) ) (f32.load (i32.add (i32.const 8) (local.get $wave_table_work_offset) ) ) )  (f32.store (i32.add (i32.const 12) (local.get $wave_table_work_offset) ) (f32.const 0) )  (i32.store (i32.add (i32.const 0) (local.get $wave_table_work_offset) ) (local.get $wave_table_offset) ) )  (func $readWaveTable (type $oscillatorFunc) (param $wave_table_work_offset i32) (result f32) (local $wave_table_offset i32) (local $counter i32) (local $value f32) (local $delta f32) (if (f32.le (local.tee $delta (f32.sub (local.tee $delta (f32.load (i32.add (i32.const 32) (local.get $wave_table_work_offset) ) ) ) (f32.load (i32.add (i32.const 24) (local.get $wave_table_work_offset) ) ) ) ) (f32.const 0) ) (then (local.set $wave_table_offset (i32.load (i32.add (i32.const 0) (local.get $wave_table_work_offset) ) ) )  (f32.store (i32.add (i32.const 12) (local.get $wave_table_work_offset) ) (local.tee $value (f32.load (i32.add (i32.shl (local.tee $counter (i32.and (i32.add (i32.load (i32.add (i32.const 28) (local.get $wave_table_work_offset) ) ) (i32.const 1) ) (i32.load (i32.add (i32.const 12) (local.get $wave_table_offset) ) ) ) ) (i32.const 2) ) (i32.add (i32.const 16) (local.get $wave_table_offset) ) ) ) ) ) (i32.store (i32.add (i32.const 28) (local.get $wave_table_work_offset) ) (local.get $counter) )   (f32.store (i32.add (i32.const 24) (local.get $wave_table_work_offset) ) (f32.mul (f32.load (i32.add (i32.const 20) (local.get $wave_table_work_offset) ) ) (f32.convert_i32_s (i32.load (i32.add (i32.const 8) (local.get $wave_table_offset) ) ) ) ) ) (f32.store (i32.add (i32.const 32) (local.get $wave_table_work_offset) ) (local.tee $delta (f32.add (local.get $delta) (f32.mul (f32.load (i32.add (i32.const 8) (local.get $wave_table_work_offset) ) ) (f32.load (i32.add (i32.const 4) (local.get $wave_table_work_offset) ) ) ) ) ) ) (return (local.get $value)) ) ) (f32.store (i32.add (i32.const 32) (local.get $wave_table_work_offset) ) (local.get $delta ) ) (f32.load (i32.add (i32.const 12) (local.get $wave_table_work_offset) ) ) )     (func $initEnvelope (param $env_param_offset i32) (param $flag i32) (param $sample_rate f32) (param $attack_time f32) (param $decay_time f32) (param $sustain_level f32) (param $release_time f32)  (i32.store (i32.add (i32.const 0) (local.get $env_param_offset) ) (local.get $flag) )  (f32.store (i32.add (i32.const 8) (local.get $env_param_offset)) (local.get $attack_time) ) (f32.store (i32.add (i32.const 24) (local.get $env_param_offset)) (f32.div (f32.const 1) (f32.mul (local.get $sample_rate) (f32.load (i32.add (i32.const 8) (local.get $env_param_offset))) ) ) )  (f32.store (i32.add (i32.const 12) (local.get $env_param_offset)) (local.get $decay_time) ) (f32.store (i32.add (i32.const 28) (local.get $env_param_offset)) (f32.div (f32.sub (f32.const 1) (f32.load (i32.add (i32.const 16) (local.get $env_param_offset))) ) (f32.mul (local.get $sample_rate) (f32.load (i32.add (i32.const 12) (local.get $env_param_offset))) ) ) )  (f32.store (i32.add (i32.const 16) (local.get $env_param_offset)) (local.get $sustain_level) )  (f32.store (i32.add (i32.const 20) (local.get $env_param_offset)) (local.get $release_time) ) (f32.store (i32.add (i32.const 32) (local.get $env_param_offset)) (f32.div (f32.load (i32.add (i32.const 16) (local.get $env_param_offset))) (f32.mul (local.get $sample_rate) (f32.load (i32.add (i32.const 20) (local.get $env_param_offset))) ) ) ) )  (func $initEnvelopeWork (param $env_work_offset i32) (param $env_param_offset i32)  (i32.store (i32.add (i32.const 0) (local.get $env_work_offset)) (local.get $env_param_offset) )  (f32.store (i32.add (i32.const 12) (local.get $env_work_offset)) (f32.const 0) )  (i32.store (i32.add (i32.const 8) (local.get $env_work_offset)) (i32.const 0) )  (i32.store (i32.add (i32.const 4) (local.get $env_work_offset)) (i32.const 0) )  (f32.store (i32.add (i32.const 16) (local.get $env_work_offset)) (f32.const 0) ) )  (func $keyOnEnvelope (param $env_work_offset i32)  (i32.store (i32.add (i32.const 4) (local.get $env_work_offset)) (i32.or (i32.const 0x80000000) (i32.load (i32.add (i32.const 4) (local.get $env_work_offset))) ) )  (i32.store (i32.add (i32.const 8) (local.get $env_work_offset)) (i32.const 0) )  (f32.store (i32.add (i32.const 12) (local.get $env_work_offset)) (f32.const 0) )  (f32.store (i32.add (i32.const 16) (local.get $env_work_offset)) (f32.const 0) ) )  (func $keyOffEnvelope (param $env_work_offset i32)  (i32.store (i32.add (i32.const 4) (local.get $env_work_offset)) (i32.and (i32.const 0x7fffffff) (i32.load (i32.add (i32.const 4) (local.get $env_work_offset))) ) )  (i32.store (i32.add (i32.const 8) (local.get $env_work_offset)) (i32.const 3) )  (f32.store (i32.add (i32.const 12) (local.get $env_work_offset)) (f32.const 0) ) )  (func $doEnvelope (param $env_work_offset i32) (result f32) (local $env_param_offset i32) (local $counter f32) (local $step i32) (local $value f32) (local.set $env_param_offset (i32.add (i32.const 0) (local.get $env_work_offset)) ) (local.set $counter (f32.load (i32.add (i32.const 12) (local.get $env_work_offset)) ) ) (local.set $step (i32.load (i32.add (i32.const 8) (local.get $env_work_offset)) ) ) (if (i32.eq (local.get $step) (i32.const -1)) (return (f32.const 0)) ) (local.set $value (f32.load (i32.add (i32.const 16) (local.get $env_work_offset)) ) ) (block $main (block $do_release (block $do_decay (block $do_attack (br_table $do_attack $do_decay $main $do_release (local.get $step) ) )  (if (f32.ge (local.tee $counter (f32.add (f32.load (i32.const 8)) (local.get $counter) ) ) (f32.load (i32.add (i32.const 8) (local.get $env_param_offset))) ) (then (i32.store (i32.add (i32.const 8) (local.get $env_work_offset)) (i32.const 1) ) (f32.store (i32.add (i32.const 12) (local.get $env_work_offset)) (local.tee $counter (f32.const 0) ) ) (f32.store (i32.add (i32.const 16) (local.get $env_work_offset)) (local.tee $value (f32.const 1) ) ) ) (else (f32.store (i32.add (i32.const 16) (local.get $env_work_offset) ) (local.tee $value (f32.add (local.get $value) (f32.load (i32.add(i32.const 24) (local.get $env_param_offset))) ) ) ) ) ) (br $main) )  (if (f32.ge (local.tee $counter (f32.add (f32.load (i32.const 8)) (local.get $counter) ) ) (f32.load (i32.add(i32.const 12) (local.get $env_param_offset))) ) (then (i32.store (i32.add (i32.const 8) (local.get $env_work_offset)) (i32.const 2) ) (f32.store (i32.add (i32.const 12) (local.get $env_work_offset)) (local.tee $counter (f32.const 0) ) ) (f32.store (i32.add (i32.const 16) (local.get $env_work_offset)) (local.tee $value (f32.load (i32.add (i32.const 16) (local.get $env_param_offset)) ) ) ) ) (else (f32.store (i32.add (i32.const 16) (local.get $env_work_offset)) (local.tee $value (f32.sub (local.get $value) (f32.load (i32.add (i32.const 28) (local.get $env_param_offset))) ) ) ) ) ) (br $main) )  (if (f32.ge (local.tee $counter (f32.add (f32.load (i32.const 8)) (local.get $counter) ) ) (f32.load (i32.add(i32.const 20) (local.get $env_param_offset))) ) (then (i32.store (i32.add (i32.const 8) (local.get $env_work_offset)) (i32.const -1) ) (f32.store (i32.add (i32.const 12) (local.get $env_work_offset)) (local.tee $counter (f32.const 0) ) ) (f32.store (i32.add (i32.const 16) (local.get $env_work_offset)) (local.tee $value (f32.const 0)) ) ) (else (f32.store (i32.add (i32.const 16) (local.get $env_work_offset)) (local.tee $value (f32.sub (local.get $value) (f32.load (i32.add (i32.const 28) (local.get $env_param_offset))) ) ) ) ) ) (br $main) )  (f32.store (i32.add (i32.const 12) (local.get $env_work_offset)) (local.get $counter) )  (return (f32.mul (local.get $value) (f32.load (i32.add (i32.const 4) (local.get $env_param_offset))) ) ) )  (func $keyOnTimbre (param $timbre_work_offset i32)  (i32.store (i32.add (i32.const 0) (local.get $timbre_work_offset) ) (i32.or (i32.load (i32.add (i32.const 0) (local.get $timbre_work_offset) ) ) (i32.const 0x1) ) )   (call $keyOnEnvelope (i32.add (i32.const 140) (local.get $timbre_work_offset) ) )  (call $keyOnEnvelope (i32.add (i32.const 288) (local.get $timbre_work_offset) ) ) ) (func $keyOffTimbre (param $timbre_work_offset i32)  (i32.store (i32.add (i32.const 0) (local.get $timbre_work_offset) ) (i32.and (i32.load (i32.add (i32.const 0) (local.get $timbre_work_offset) ) ) (i32.const 0xffff_fffe) ) )   (call $keyOffEnvelope (i32.add (i32.const 140) (local.get $timbre_work_offset) ) )  (call $keyOffEnvelope (i32.add (i32.const 288) (local.get $timbre_work_offset) ) ) ) (func $processTimbre (param $timbre_work_offset i32) (result f32) (local $oscillator_work_offset i32) (local $pitch_lfo_work_offset i32) (local $amplitude_lfo_work_offset i32) (local $pitch f32) (local $oscillator_offset i32) (local.set $oscillator_offset (i32.load (i32.add (i32.const 0) (local.get $timbre_work_offset) ) ) )   (f32.store (i32.add (i32.const 4) (local.tee $oscillator_work_offset (i32.load (i32.add (i32.const 12) (local.get $timbre_work_offset) ) ) ) ) (f32.mul (f32.mul  (local.tee $pitch (f32.load (i32.add (i32.const 8) (local.get $timbre_work_offset) ) ) )  (select (f32.const 0) (call_indirect (type $oscillatorFunc) (local.tee $pitch_lfo_work_offset (i32.load (i32.add (i32.const 160) (local.get $timbre_work_offset) ) ) ) (i32.load (i32.add (i32.const 4) (i32.load (i32.add (i32.const 0) (local.get $pitch_lfo_work_offset) ) ) ) ) ) (i32.eqz (i32.and (i32.load (i32.add (i32.const 0) (i32.load (i32.add (i32.const 0) (local.get $pitch_lfo_work_offset) ) ) ) ) (i32.const 0x8000_0000) ) ) ) )  (call $doEnvelope (i32.load (i32.add (i32.const 140) (local.get $timbre_work_offset) ) ) ) ) )   (f32.store (i32.add (i32.const 440) (local.get $timbre_work_offset) ) (f32.mul (f32.mul (f32.mul  (call_indirect (type $oscillatorFunc) (local.get $oscillator_work_offset) (i32.load (i32.add (i32.const 4) (local.get $oscillator_offset) ) ) )  (call_indirect (type $oscillatorFunc) (local.tee $amplitude_lfo_work_offset (i32.load (i32.add (i32.const 308) (local.get $timbre_work_offset) ) ) ) (i32.load (i32.add (i32.const 4) (i32.load (i32.add (i32.const 0) (local.get $amplitude_lfo_work_offset) ) ) ) ) ) )  (call $doEnvelope (i32.load (i32.add (i32.const 288) (local.get $timbre_work_offset) ) ) ) )  (f32.load (i32.add (i32.const 436) (local.get $timbre_work_offset) ) ) ) )  (f32.load (i32.add (i32.const 440) (local.get $timbre_work_offset) ) ) ) ) 