  (module (export "setQuality" (func $set_quality)) (export "setRate" (func $set_rate)) (export "init" (func $init)) (export "setVolumeMode" (func $set_volume_mode)) (export "setMask" (func $set_mask)) (export "toggleMask" (func $toggle_mask)) (export "readIo" (func $read_io)) (export "readReg" (func $read_reg)) (export "writeIo" (func $write_io)) (export "updateOutput" (func $update_output)) (export "mixOutput" (func $mix_output)) (export "calc" (func $calc)) (export "render" (func $render)) (export "fill" (func $fill)) (export "reset" (func $reset)) (export "writeReg" (func $write_reg))  (import "env" "memory" (memory $memory 1 10 shared)) (data (i32.const 0) "\ff\00\00\00\0f\00\00\00\ff\00\00\00\0f\00\00\00\ff\00\00\00\0f\00\00\00\1f\00\00\00\3f\00\00\00\1f\00\00\00\1f\00\00\00\1f\00\00\00\ff\00\00\00\ff\00\00\00\0f\00\00\00\ff\00\00\00\ff\00\00\00")(data (i32.const 64) "\00\00\00\00\01\00\00\00\01\00\00\00\02\00\00\00\02\00\00\00\03\00\00\00\03\00\00\00\04\00\00\00\05\00\00\00\06\00\00\00\07\00\00\00\09\00\00\00\0b\00\00\00\0d\00\00\00\0f\00\00\00\12\00\00\00\16\00\00\00\1a\00\00\00\1f\00\00\00\25\00\00\00\2d\00\00\00\35\00\00\00\3f\00\00\00\4c\00\00\00\5a\00\00\00\6a\00\00\00\7f\00\00\00\97\00\00\00\b4\00\00\00\d6\00\00\00\ff\00\00\00\ff\00\00\00\00\00\00\00\00\00\00\00\01\00\00\00\01\00\00\00\02\00\00\00\02\00\00\00\03\00\00\00\03\00\00\00\05\00\00\00\05\00\00\00\07\00\00\00\07\00\00\00\0b\00\00\00\0b\00\00\00\0f\00\00\00\0f\00\00\00\16\00\00\00\16\00\00\00\1f\00\00\00\1f\00\00\00\2d\00\00\00\2d\00\00\00\3f\00\00\00\3f\00\00\00\5a\00\00\00\5a\00\00\00\7f\00\00\00\7f\00\00\00\b4\00\00\00\b4\00\00\00\ff\00\00\00\ff\00\00\00") (func $internal_refresh (if  (i32.load (i32.const 404)) (then (i32.store (i32.const 400) (i32.const 16777216)) (i32.store (i32.const 544) (i32.div_u (i32.const -2147483648) (i32.load (i32.const 396)) ) ) (i32.store (i32.const 552) (i32.div_u (i32.const -2147483648) (i32.shr_u (i32.load (i32.const 392)) (i32.const 4)) ) ) (i32.store (i32.const 548) (i32.const 0)) ) (else (i32.store (i32.const 400) (i32.trunc_f64_u (f64.div (f64.mul (f64.convert_i32_u (i32.load (i32.const 392))) (f64.const 16777216) ) (f64.mul (f64.convert_i32_u (i32.load (i32.const 396))) (f64.const 16) ) ) ) ) ) ) ) (func $set_rate (param $r i32) (i32.store (i32.const 396) (select (local.get $r) (i32.const 44100) (local.get $r)) ) (call $internal_refresh) ) (func $set_quality (param $q i32) (i32.store (i32.const 404) (local.get $q) ) (call $internal_refresh) ) (func $init (param $c i32) (param $r i32) (call $set_volume_mode (i32.const 1)) (i32.store (i32.const 392) (local.get $c)) (i32.store (i32.const 396) (select (i32.const 44100) (local.get $r) (i32.eqz (local.get $r)) ) ) (call $set_quality (i32.const 0)) ) (func $set_volume_mode (param $type i32) (i32.store (i32.const 384) (i32.add (i32.const 64) (i32.shl (local.get $type) (i32.const 7)) ) ) ) (func $set_mask (param $mask i32) (result i32) (i32.load (i32.const 480)) (i32.store (i32.const 480) (local.get $mask)) ) (func $toggle_mask (param $mask i32) (result i32) (i32.load (i32.const 480)) (i32.store (i32.const 480) (i32.xor (i32.load (i32.const 480)) (i32.const 0xffff_ffff)) ) ) (func $reset (local $c i32) (local $work i32) (local $size i32) (local $count i32) (local $freq i32) (local $edge i32) (local $volume i32) (local $ch_out i32) (local.set $count (i32.const 408)) (local.set $freq (i32.const 432)) (local.set $edge (i32.const 444)) (local.set $volume (i32.const 420)) (local.set $ch_out (i32.const 560)) (i32.store (i32.const 484) (i32.const 0)) (local.set $c (i32.const 3)) (block $exit (loop $loop (br_if $exit (i32.eqz (local.get $c))) (local.set $c (i32.sub (local.get $c) (i32.const 1))) (i32.store (local.get $count) (i32.const 0x1000)) (i32.store (local.get $freq) (i32.const 0)) (i32.store (local.get $edge) (i32.const 0)) (i32.store (local.get $volume) (i32.const 0)) (i32.store (local.get $ch_out) (i32.const 0)) (local.set $count (i32.add (local.get $count) (i32.const 4))) (local.set $freq (i32.add (local.get $freq) (i32.const 4))) (local.set $edge (i32.add (local.get $edge) (i32.const 4))) (local.set $volume (i32.add (local.get $volume) (i32.const 4))) (local.set $ch_out (i32.add (local.get $ch_out) (i32.const 4))) (br $loop) ) ) (i32.store (i32.const 480) (i32.const 0))  (local.set $c (i32.const 16)) (local.set $work (i32.const 320)) (block $exit_reg (loop $loop_reg (br_if $exit_reg (i32.eqz(local.get $c) )) (local.set $c (i32.sub (local.get $c) (i32.const 1))) (i32.store (local.get $work) (i32.const 0)) (local.set $work (i32.add (local.get $work) (i32.const 4)) ) (br $loop_reg) ) ) (i32.store (i32.const 556) (i32.const 0)) (i32.store (i32.const 532) (i32.const 0xffff)) (i32.store (i32.const 536) (i32.const 0x40)) (i32.store (i32.const 540) (i32.const 0)) (i32.store (i32.const 488) (i32.const 0)) (i32.store (i32.const 492) (i32.const 0)) (i32.store (i32.const 524) (i32.const 0)) (i32.store (i32.const 528) (i32.const 0)) (i32.store (i32.const 516) (i32.const 1)) (i32.store (i32.const 388) (i32.const 0))  (i32.store (i32.const 580) (i32.const 0)) (i32.store (i32.const 584) (i32.const 0)) ) (func $read_io (result i32) (i32.load (i32.add (i32.const 320) (i32.shl (i32.load (i32.const 556)) (i32.const 2)) ) ) ) (func $read_reg (param $reg i32) (result i32) (i32.load (i32.add (i32.const 320) (i32.shl (local.get $reg) (i32.const 2)) ) ) ) (func $write_io (param $adr i32) (param $val i32) (if (i32.and (local.get $adr) (i32.const 1)) (then (call $write_reg (i32.load (i32.const 556)) (local.get $val)) ) (else (i32.store (i32.const 556) (i32.and (local.get $val) (i32.const 0x1f))) ) ) ) (func $update_output (local $incr i32) (local $noise i32) (local $i i32) (local $offset i32) (i32.store (i32.const 484) (i32.add (i32.load (i32.const 484)) (i32.load (i32.const 400)) ) ) (local.set $incr (i32.shr_u (i32.load (i32.const 484)) (i32.const 24))) (i32.store (i32.const 484) (i32.and (i32.load(i32.const 484)) (i32.const 16777215) ) )  (i32.store (i32.const 528) (i32.add (i32.load (i32.const 528)) (local.get $incr) ) ) (block $exit_envelope (loop $loop_envelope (br_if $exit_envelope (i32.or (i32.lt_u (i32.load (i32.const 528)) (i32.const 0x10000)) (i32.eqz (i32.load (i32.const 524) )) ) ) (if (i32.eqz (i32.load (i32.const 516))) (then (if (i32.load (i32.const 496)) (then (i32.store (i32.const 492) (i32.and (i32.add (i32.load (i32.const 492)) (i32.const 1) ) (i32.const 0x3f) ) ) ) (else (i32.store (i32.const 492) (i32.and (i32.add (i32.load (i32.const 492)) (i32.const 0x3f) ) (i32.const 0x3f) ) ) ) ) ) ) (if (i32.and (i32.load (i32.const 492)) (i32.const 0x20)) (then (if (i32.load (i32.const 500)) (then (if (i32.xor (i32.load (i32.const 508)) (i32.load (i32.const 512)) ) (then (i32.store (i32.const 496) (i32.xor (i32.load (i32.const 496)) (i32.const 1) ) ) ) ) (if (i32.load (i32.const 512)) (then (i32.store (i32.const 516) (i32.const 1)) ) ) (i32.store (i32.const 492) (select (i32.const 0) (i32.const 0x1f) (i32.load (i32.const 496)) ) ) ) (else (i32.store (i32.const 516) (i32.const 1)) (i32.store (i32.const 492) (i32.const 0)) ) ) ) ) (i32.store (i32.const 528) (i32.sub (i32.load (i32.const 528)) (i32.load (i32.const 524)) ) ) (br $loop_envelope) ) )  (i32.store (i32.const 536) (i32.add (i32.load (i32.const 536)) (local.get $incr) ) ) (if (i32.and (i32.load (i32.const 536)) (i32.const 0x40)) (then (if (i32.and (i32.load (i32.const 532)) (i32.const 1) ) (then (i32.store (i32.const 532) (i32.xor (i32.load (i32.const 532)) (i32.const 0x24000) ) ) ) ) (i32.store (i32.const 532) (i32.shr_u (i32.load (i32.const 532)) (i32.const 1) ) ) (i32.store (i32.const 536) (i32.sub (i32.load (i32.const 536)) (select (i32.load (i32.const 540)) (i32.const 2) (i32.load (i32.const 540)) ) ) ) ) ) (local.set $noise (i32.and (i32.load (i32.const 532)) (i32.const 1) ) )  (local.set $i (i32.const 3)) (block $tone_exit (loop $tone_loop (br_if $tone_exit (i32.eqz (local.get $i))) (local.set $i (i32.sub (local.get $i) (i32.const 1)) ) (local.set $offset (i32.shl (local.get $i) (i32.const 2) ) ) (i32.store (i32.add (i32.const 408) (local.get $offset) ) (i32.add (i32.load (i32.add (i32.const 408) (local.get $offset) ) ) (local.get $incr) ) ) (if (i32.and (i32.load (i32.add (i32.const 408) (local.get $offset) ) ) (i32.const 0x1000) ) (then (if (i32.gt_u (i32.load (i32.add (i32.const 432) (local.get $offset) ) ) (i32.const 1) ) (then (i32.store (i32.add (i32.const 444) (local.get $offset) ) (i32.xor (i32.load (i32.add (i32.const 444) (local.get $offset) ) ) (i32.const 0x1 ) ) ) (i32.store (i32.add (i32.const 408) (local.get $offset) ) (i32.sub (i32.load (i32.add (i32.const 408) (local.get $offset) ) ) (i32.load (i32.add (i32.const 432) (local.get $offset) ) ) ) ) ) (else (i32.store (i32.add (i32.const 444) (local.get $offset) ) (i32.const 1) ) ) ) ) ) (if (i32.and (select (i32.const 1) (i32.const 0) (i32.or (i32.load (i32.add (i32.const 456) (local.get $offset))) (i32.load (i32.add (i32.const 444) (local.get $offset))) ) ) (select (i32.const 1) (i32.const 0) (i32.or (i32.load (i32.add (i32.const 468) (local.get $offset))) (local.get $noise) ) ) ) (then (if (i32.eqz (i32.and (i32.load (i32.add (i32.const 420) (local.get $offset) ) ) (i32.const 32) ) ) (then (i32.store (i32.add (i32.const 560) (local.get $offset) ) (i32.add (i32.load (i32.add (i32.const 560) (local.get $offset) ) ) (i32.shl (i32.load (i32.add (i32.load (i32.const 384)) (i32.shl (i32.and (i32.load (i32.add (i32.const 420) (local.get $offset) ) ) (i32.const 31) ) (i32.const 2) ) ) ) (i32.const 4) ) ) ) ) (else (i32.store (i32.add (i32.const 560) (local.get $offset) ) (i32.add (i32.load (i32.add (i32.const 560) (local.get $offset) ) ) (i32.shl (i32.load (i32.add (i32.load (i32.const 384)) (i32.shl (i32.load (i32.const 492)) (i32.const 2) ) ) ) (i32.const 4) ) ) ) ) ) ) ) (i32.store (i32.add (i32.const 560) (local.get $offset) ) (i32.shr_u (i32.load (i32.add (i32.const 560) (local.get $offset) ) ) (i32.const 1) ) ) (br $tone_loop) ) ) ) (func $mix_output (result i32) (i32.store (i32.const 388) (i32.add (i32.load (i32.const 560)) (i32.add (i32.load (i32.const 564)) (i32.load (i32.const 568)) ) ) ) (i32.load (i32.const 388)) ) (func $calc (result i32) (if (i32.eqz (i32.load (i32.const 404))) (then call $update_output call $mix_output return ) ) (block $rate_loop_exit (loop $rate_loop (br_if $rate_loop_exit (i32.le_u (i32.load(i32.const 544)) (i32.load(i32.const 548))) ) (i32.store (i32.const 548) (i32.add (i32.load(i32.const 548)) (i32.load(i32.const 552)) ) ) call $update_output (br $rate_loop) ) ) (i32.store (i32.const 548) (i32.sub (i32.load(i32.const 548)) (i32.load(i32.const 544)) ) ) call $mix_output )  (func $fill (local $end i32) (local $woffset i32) (local $output f32) (local.set $end (i32.add (i32.const 588) (i32.load (i32.const 576))) ) (local.set $woffset (i32.const 588)) (block $fill_exit (loop $fill_loop (br_if $fill_exit (i32.gt_s (local.get $woffset) (local.get $end))) (f32.store (local.get $woffset) (f32.div (f32.convert_i32_s (call $calc)) (f32.const 16384) ) ) (local.set $woffset (i32.add (local.get $woffset) (i32.const 4))) (br $fill_loop) ) ) )  (func $render  (local $woffset i32) (local $roffset i32) (local $buffer_mask i32)  (local.set $woffset (i32.load (i32.const 584)) ) (local.set $roffset (i32.load (i32.const 580)) ) (local.set $buffer_mask (i32.sub (i32.load (i32.const 576)) (i32.const 1) ) ) (block $render_exit (loop $render_loop (br_if $render_exit (i32.eq (local.get $roffset) (local.get $woffset))) (f32.store (i32.add (i32.const 588) (local.get $woffset)) (f32.div (f32.convert_i32_s (call $calc)) (f32.const 16384) ) ) (local.set $woffset (i32.and (i32.add (local.get $woffset) (i32.const 4)) (local.get $buffer_mask) ) ) (br $render_loop) ) ) (i32.atomic.store (i32.const 584) (local.get $woffset)) ) (func $write_reg (param $reg i32) (param $val i32) (local $c i32) (local $w i32) (if (i32.gt_u (local.get $reg) (i32.const 15)) (then return ) ) (local.set $val (i32.and (local.get $val) (i32.load (i32.add (i32.const 0) (i32.shl (local.get $reg) (i32.const 2) ) ) ) ) ) (i32.store (i32.add (i32.const 320) (i32.shl (local.get $reg) (i32.const 2) ) ) (local.get $val) ) (block $default (br_if $default (i32.gt_u (local.get $reg) (i32.const 13))) (block $reg0_5 (block $reg6 (block $reg7 (block $reg8_10 (block $reg11_12 (block $reg13 (br_table $reg0_5 $reg0_5 $reg0_5 $reg0_5 $reg0_5 $reg0_5 $reg6 $reg7 $reg8_10 $reg8_10 $reg8_10 $reg11_12 $reg11_12 $reg13 (local.get $reg) ) )  (i32.store (i32.const 500) (i32.and (i32.shr_u (local.get $val) (i32.const 3)) (i32.const 1) ) ) (i32.store (i32.const 504) (i32.and (i32.shr_u (local.get $val) (i32.const 2)) (i32.const 1) ) ) (i32.store (i32.const 508) (i32.and (i32.shr_u (local.get $val) (i32.const 1)) (i32.const 1) ) ) (i32.store (i32.const 512) (i32.and (local.get $val) (i32.const 1) ) ) (i32.store (i32.const 496) (i32.load (i32.const 504)) ) (i32.store (i32.const 516) (i32.const 0) ) (i32.store (i32.const 528) (i32.sub (i32.const 0x10000) (i32.load (i32.const 524)) ) ) (i32.store (i32.const 492) (select (i32.const 0) (i32.const 0x1f) (i32.load (i32.const 496)) ) ) return )  (i32.store (i32.const 524) (i32.add (i32.shl (i32.load (i32.const 368)) (i32.const 8) ) (i32.load(i32.const 364)) ) ) return )  (i32.store (i32.add (i32.const 420) (i32.shl (i32.sub (local.get $reg) (i32.const 8)) (i32.const 2) ) ) (i32.shl (local.get $val) (i32.const 1) ) ) return )   (i32.store (i32.const 456) (i32.and (local.get $val) (i32.const 1))) (i32.store (i32.const 460) (i32.and (local.get $val) (i32.const 2))) (i32.store (i32.const 464) (i32.and (local.get $val) (i32.const 4))) (i32.store (i32.const 468) (i32.and (local.get $val) (i32.const 8))) (i32.store (i32.const 472) (i32.and (local.get $val) (i32.const 16))) (i32.store (i32.const 476) (i32.and (local.get $val) (i32.const 32))) return )  (i32.store (i32.const 540) (i32.shl (i32.and (local.get $val) (i32.const 31) ) (i32.const 1) ) ) return )  (local.set $c (i32.shr_u (local.get $reg) (i32.const 1) ) ) (i32.store (i32.add (i32.const 432) (i32.shl (local.get $c) (i32.const 2)) ) (i32.add (i32.shl (i32.and (i32.load (i32.add (i32.const 320) (i32.shl (i32.add (i32.shl (local.get $c) (i32.const 1) ) (i32.const 1) ) (i32.const 2) ) ) ) (i32.const 15) ) (i32.const 8) ) (i32.load (i32.add (i32.const 320) (i32.shl (i32.shl (local.get $c) (i32.const 1) ) (i32.const 2) ) ) ) ) ) return ) ) ) 